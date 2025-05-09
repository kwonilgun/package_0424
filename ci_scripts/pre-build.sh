#!/bin/sh

echo "Running pre-build script: Installing CocoaPods dependencies..."

cd $CI_WORKSPACE/ios  # Xcode Cloud의 작업 디렉토리로 이동

# CocoaPods 설치 (필요한 경우)
gem install cocoapods --user-install

# Pod 설치
pod install --repo-update

echo "CocoaPods installation complete."