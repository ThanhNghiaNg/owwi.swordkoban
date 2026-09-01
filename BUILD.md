# Build Android và iOS

Tài liệu này mô tả quy trình build dự án **Swordkoban** bằng Tauri 2, bao gồm chạy trên thiết bị thật, ký bản Android release và xử lý các lỗi Xcode đã gặp trong dự án.

Bản production trên mọi nền tảng tải giao diện từ <https://swordkoban.owwi.net>. Vì vậy thiết bị cần kết nối Internet khi mở ứng dụng. Các lệnh development vẫn dùng Vite tại `http://localhost:1420` để hỗ trợ HMR.

## 1. Chuẩn bị chung

Yêu cầu:

- Node.js 22 và npm.
- Rust stable và `rustup`.
- Chạy lệnh từ thư mục gốc của repository.

Cài dependency JavaScript:

```bash
npm install
```

Kiểm tra frontend trước khi build mobile:

```bash
npm run check
```

> `src-tauri/gen/android` và `src-tauri/gen/apple` đã tồn tại. Không chạy lại `tauri android init` hoặc `tauri ios init` nếu không thực sự muốn tạo lại project native, vì thao tác này có thể ghi đè cấu hình signing và build script hiện tại.

## 2. Android

### 2.1. Công cụ cần thiết

Cài Android Studio và dùng SDK Manager để cài:

- Android SDK Platform 36.
- Android SDK Build-Tools 36.
- Android SDK Platform-Tools.
- Android NDK `29.0.13113456`.
- JDK 17 hoặc JDK tương thích với Android Gradle Plugin hiện tại.

Thiết lập biến môi trường trên macOS nếu terminal chưa nhận Android SDK:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/29.0.13113456"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

Cài các Rust target Android:

```bash
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

### 2.2. Chạy development trên thiết bị

Trên điện thoại Android:

1. Bật Developer Options.
2. Bật USB debugging.
3. Kết nối điện thoại với máy và chấp nhận RSA authorization.

Kiểm tra thiết bị:

```bash
adb devices
```

Chạy ứng dụng:

```bash
npm run tauri:android:dev
```

### 2.3. Build APK debug

APK debug được Android tự ký và có thể cài trực tiếp:

```bash
npm run tauri:android:build -- --debug --apk
```

File đầu ra:

```text
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

Cài bằng ADB:

```bash
adb install -r \
  src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

### 2.4. Tạo keystore cho bản release

Chỉ cần tạo keystore một lần:

```bash
keytool -genkeypair \
  -v \
  -keystore upload-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload
```

Không commit hoặc chia sẻ keystore và mật khẩu. Hãy sao lưu `upload-keystore.jks` ở nơi an toàn; cần đúng key này để phát hành các bản cập nhật sau này.

Tạo file `src-tauri/gen/android/keystore.properties`:

```properties
storeFile=/duong/dan/tuyet/doi/toi/upload-keystore.jks
storePassword=MAT_KHAU_KEYSTORE
keyAlias=upload
keyPassword=MAT_KHAU_CUA_KEY
```

Với keystore hiện tại của dự án, `storePassword` và `keyPassword` giống nhau. Không đặt mật khẩu trong dấu nháy. File `keystore.properties` và các file `*.jks` đã được `.gitignore`.

Cấu hình Gradle đọc file trên đã có trong:

```text
src-tauri/gen/android/app/build.gradle.kts
```

### 2.5. Build APK release đã ký

```bash
npm run tauri:android:build -- --apk
```

File đầu ra:

```text
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

Kiểm tra chữ ký:

```bash
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify \
  --verbose \
  --print-certs \
  src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

Kết quả hợp lệ phải có dòng `Verifies`.

Cài lên thiết bị:

```bash
adb install -r \
  src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

Nếu ADB báo `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, trên thiết bị đang có cùng package nhưng được ký bằng key khác. Gỡ bản cũ sẽ xóa dữ liệu game:

```bash
adb uninstall com.owwi.swordkoban
```

Sau đó chạy lại lệnh cài APK.

### 2.6. Build AAB cho Google Play

```bash
npm run tauri:android:build -- --aab
```

File đầu ra:

```text
src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab
```

File AAB dùng để upload lên Google Play Console và không cài trực tiếp bằng `adb install`.

### 2.7. Lỗi Android thường gặp

#### `keystore password was incorrect`

`storePassword` trong `keystore.properties` không đúng mật khẩu của file JKS. Kiểm tra keystore và alias bằng:

```bash
keytool -list -keystore upload-keystore.jks -alias upload
```

#### APK có chữ `unsigned`

APK release chưa được ký. Kiểm tra lại sự tồn tại và nội dung của:

```text
src-tauri/gen/android/keystore.properties
```

## 3. iOS

> iOS chỉ build được trên macOS có Xcode. Chạy trên Simulator và iPhone cá nhân có thể dùng miễn phí. TestFlight và App Store yêu cầu Apple Developer Program trả phí.

### 3.1. Công cụ và Rust targets

Cài Xcode từ App Store, mở Xcode ít nhất một lần và chấp nhận license. Kiểm tra command-line tools:

```bash
xcode-select -p
```

Cài các Rust target iOS:

```bash
rustup target add \
  aarch64-apple-ios \
  aarch64-apple-ios-sim \
  x86_64-apple-ios
```

### 3.2. Đăng ký Apple Developer miễn phí

1. Mở <https://developer.apple.com/register/>.
2. Đăng nhập Apple Account.
3. Chấp nhận Apple Developer Agreement.
4. Trong Xcode, mở `Xcode > Settings > Apple Accounts` và đăng nhập cùng tài khoản.

Tài khoản miễn phí sẽ xuất hiện dưới dạng `Personal Team`. Provisioning profile miễn phí hết hạn định kỳ và cần build/cài lại ứng dụng.

### 3.3. Mở project bằng Xcode

```bash
npm run tauri:ios:build -- --open
```

Trong cửa sổ project Xcode:

1. Chọn project `swordkoban` màu xanh ở Project Navigator.
2. Trong `TARGETS`, chọn `swordkoban_iOS`.
3. Mở `Signing & Capabilities`.
4. Bật `Automatically manage signing`.
5. Chọn Apple Developer Team.

Team ID là thông tin riêng theo từng Apple Account. Không ghi Team ID thật vào tài liệu hoặc commit lên Git. Khi build tự động từ terminal, truyền nó bằng biến môi trường cục bộ:

```bash
export APPLE_DEVELOPMENT_TEAM="<APPLE_TEAM_ID>"
npm run tauri:ios:build -- --open
```

Không lưu lệnh `export` chứa Team ID thật vào file `.md` hoặc source code. Khi build bằng Xcode, chọn Team trong `Signing & Capabilities`; kiểm tra và loại bỏ thay đổi `DEVELOPMENT_TEAM` khỏi `project.pbxproj` trước khi commit nếu không muốn công khai định danh tài khoản.

Bundle Identifier hiện tại:

```text
com.swordkoban.game
```

Nếu Apple báo Bundle Identifier không khả dụng, đổi `identifier` trong `src-tauri/tauri.conf.json` sang một giá trị duy nhất. Không chỉ sửa trực tiếp trong Xcode vì Tauri có thể ghi đè thay đổi đó.

### 3.4. Chạy trên iOS Simulator

Trong Xcode:

1. Chọn một iPhone Simulator ở thanh chọn destination.
2. Nhấn Run hoặc `Command + R`.

Simulator không cần provisioning profile cho thiết bị thật.

### 3.5. Chạy trên iPhone thật

1. Kết nối iPhone với Mac và chọn `Trust This Computer`.
2. Mở `Window > Devices and Simulators` trong Xcode và chờ thiết bị sẵn sàng.
3. Trên iPhone, bật `Settings > Privacy & Security > Developer Mode`.
4. Chọn iPhone làm destination trong Xcode.
5. Trở lại `Signing & Capabilities`; nếu cần, nhấn `Try Again` để Xcode tạo provisioning profile.
6. Nhấn Run hoặc `Command + R`.

Nếu iPhone yêu cầu tin cậy developer:

```text
Settings
> General
> VPN & Device Management
> Developer App
> Apple Account
> Trust
```

Sau đó chạy lại ứng dụng.

### 3.6. Cấu hình build script riêng của dự án

Xcode mở từ giao diện đồ họa không luôn kế thừa `PATH` của terminal. Build phase `Build Rust Code` đã được cấu hình để tìm Node, npm và Rust:

```text
$HOME/.nvm/versions/node/v22.11.0/bin
$HOME/.cargo/bin
/opt/homebrew/bin
/usr/local/bin
```

Cấu hình nằm trong:

```text
src-tauri/gen/apple/project.yml
src-tauri/gen/apple/swordkoban.xcodeproj/project.pbxproj
```

Nếu đổi phiên bản Node được cài qua NVM, chạy `command -v npm` và cập nhật đường dẫn Node trong build script.

`ENABLE_USER_SCRIPT_SANDBOXING` cũng được đặt thành `false` để Cargo có thể đọc source trong `src-tauri`. Nếu bật lại tùy chọn này, build có thể lỗi khi Cargo xác định package fingerprint.

### 3.7. Build IPA cho TestFlight hoặc App Store

Phần này yêu cầu Apple Developer Program trả phí và signing distribution hợp lệ.

Build bằng Tauri CLI:

```bash
npm run tauri:ios:build -- \
  --build-number 1 \
  --export-method app-store-connect
```

IPA được tạo trong:

```text
src-tauri/gen/apple/build/arm64/
```

Hoặc phân phối bằng Xcode:

1. Chọn `Any iOS Device` làm destination.
2. Chọn `Product > Archive`.
3. Trong Organizer, chọn archive vừa tạo.
4. Chọn `Validate App` nếu muốn kiểm tra trước.
5. Chọn `Distribute App > TestFlight & App Store > Upload`.

Mỗi lần upload phải dùng build number mới:

```bash
npm run tauri:ios:build -- \
  --build-number 2 \
  --export-method app-store-connect
```

### 3.8. Lỗi iOS thường gặp

#### `npm: command not found`

Xcode không tìm thấy Node/npm. Kiểm tra:

```bash
command -v npm
```

Sau đó cập nhật `PATH` trong build phase được mô tả ở mục 3.6.

#### `failed to determine package fingerprint`

Xcode đang sandbox build script và chặn Cargo đọc `src-tauri`. Đảm bảo `ENABLE_USER_SCRIPT_SANDBOXING` đang là `false` trong `src-tauri/gen/apple/project.yml` và `NO` trong Xcode Build Settings.

#### `No profiles were found`

Với Personal Team, kết nối iPhone thật, chọn thiết bị làm destination rồi nhấn `Try Again` trong `Signing & Capabilities`. Xcode cần thiết bị để tạo provisioning profile development.

#### `Command PhaseScriptExecution failed with a nonzero exit code`

Đây chỉ là thông báo tổng quát. Trong Issue Navigator, mở lỗi rồi xem phần output của `Build Rust Code`; nguyên nhân thật thường nằm ở những dòng ngay phía trên.

## 4. Build Windows EXE bằng GitHub Actions

Workflow Windows nằm tại:

```text
.github/workflows/build-windows.yml
```

Workflow sử dụng runner `windows-latest` và tạo bộ cài NSIS x64 dạng `.exe`. Có hai cách chạy:

### 4.1. Chạy thủ công

1. Push repository lên GitHub.
2. Mở tab `Actions`.
3. Chọn workflow `Build Windows EXE`.
4. Chọn `Run workflow`.
5. Chờ job `Build Windows x64 NSIS installer` hoàn tất.
6. Ở cuối trang workflow run, tải artifact có tên dạng `swordkoban-<version>-windows-x86_64-nsis`.

Giải nén artifact để lấy file cài đặt `.exe`.

### 4.2. Chạy bằng Git tag

Workflow tự chạy với tag bắt đầu bằng `v`:

```bash
git tag v1.0.1
git push origin v1.0.1
```

### 4.3. Vị trí file trên runner

Trong quá trình build, bộ cài nằm tại:

```text
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe
```

Workflow chỉ upload Actions Artifact, không tự tạo GitHub Release và chỉ cần quyền `contents: read`. Không cần khai báo GitHub Secret cho bản build chưa ký.

> Bộ cài hiện chưa có chứng thư code signing. Windows SmartScreen có thể cảnh báo `Unknown publisher`; đây không phải lỗi build. Muốn loại bỏ cảnh báo cho bản phát hành công khai cần chứng thư ký code Windows và cấu hình signing riêng.

## 5. Build Linux bằng GitHub Actions

Workflow Linux nằm tại:

```text
.github/workflows/build-linux.yml
```

Workflow sử dụng `ubuntu-22.04` làm baseline x64 và tạo hai định dạng:

- `AppImage`: chạy trực tiếp trên nhiều bản phân phối Linux.
- `.deb`: cài trên Ubuntu, Debian và các hệ điều hành tương thích.

### 5.1. Chạy thủ công

1. Push repository lên GitHub.
2. Mở tab `Actions`.
3. Chọn workflow `Build Linux Packages`.
4. Chọn `Run workflow`.
5. Chờ job `Build Linux x64 AppImage and DEB` hoàn tất.
6. Tải hai artifact Linux ở cuối trang workflow run.

Artifact có tên dạng:

```text
swordkoban-<version>-linux-x86_64-appimage
swordkoban-<version>-linux-x86_64-deb
```

Workflow cũng tự chạy khi push Git tag bắt đầu bằng `v`, giống workflow Windows.

### 5.2. Vị trí file trên runner

```text
src-tauri/target/release/bundle/appimage/*.AppImage
src-tauri/target/release/bundle/deb/*.deb
```

### 5.3. Chạy AppImage

Sau khi tải và giải nén artifact:

```bash
chmod +x ./*.AppImage
./*.AppImage
```

### 5.4. Cài gói DEB

```bash
sudo apt install ./swordkoban*.deb
```

Workflow chỉ upload Actions Artifacts, có quyền `contents: read` và không cần GitHub Secret. `ubuntu-22.04` được dùng thay vì `ubuntu-latest` để giữ mức yêu cầu `glibc` thấp hơn và tăng khả năng chạy trên các distro Linux cũ.

## 6. Phiên bản ứng dụng

Phiên bản chung nằm trong `src-tauri/tauri.conf.json`:

```json
{
  "version": "1.0.1"
}
```

Trước khi phát hành bản mới:

- Tăng `version` theo SemVer.
- Android phải có `versionCode` lớn hơn bản đã upload trước đó.
- iOS phải có build number chưa từng được upload cho version đó.

## 7. Tài liệu chính thức

- Tauri mobile prerequisites: <https://v2.tauri.app/start/prerequisites/>
- Tauri Android signing: <https://v2.tauri.app/distribute/sign/android/>
- Tauri iOS signing: <https://v2.tauri.app/distribute/sign/ios/>
- Tauri App Store distribution: <https://v2.tauri.app/distribute/app-store/>
- Tauri GitHub Actions pipeline: <https://v2.tauri.app/distribute/pipelines/github/>
- Tauri AppImage distribution: <https://v2.tauri.app/distribute/appimage/>
- Apple Developer registration: <https://developer.apple.com/register/>
