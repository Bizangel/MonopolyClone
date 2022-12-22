#!/bin/bash
cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

target_os=$1
target_arch=$2

if [[ "$target_os" == "" ]] || [[ "$target_arch" == "" ]]
then
  echo "Both Target OS as well as arch must be specified!"
  printf "\nExample usage: ./build.sh linux x64"
  exit -1
fi

dotnet_result=$(dotnet publish --configuration release --os $target_os --arch $target_arch)

if [[ "$dotnet_result" == *"error"* ]];
then
  printf "${RED}\nBuild Error Detected: \n ${dotnet_result} ${NC}"
  exit -1
fi

rm -rf bin/out # clean previous output

cp bin/Release/net6.0/${target_os}-${target_arch}/publish bin/out -R # make our own folder for output

# clear any previous state
rm bin/out/monopolystate.json

## copy dependency of gamedata
cp gamedata bin/out/gamedata -R

## generate a new fresh key
key=$(openssl rand -hex 32)

## set a default .env for guide
echo "ENCRYPTIONKEY=${key}
ENABLE_SWAGGER=false
ALTERNATE_CARDS=false
STATIC_PATH=./static
DEVELOPMENT_CORS=https://192.168.0.69:3000
" > bin/out/.env

## Generate frontend files and move them to folder
cd ../Frontend/
if [ -d "build" ]; then
    printf "\n Build React output folder already exists! Simply copying. Delete and rerun to rebuild it or rebuild it manually. \n"
else
    printf "\n Build folder from react is not present, building... \n "
    npm run build
fi

cp build ../Backend/bin/out/static -R
fullpath=$(realpath ../Backend/bin/out)
fullpath_settings=$(realpath ../Backend/bin/out/appsettings.json)
keypath=$(realpath ../Backend/bin/out/key.pem)
certpath=$(realpath ../Backend/bin/out/cert.pem)

printf "\nConfiguration for Server settings can be set in ${fullpath_settings}\n"
printf "\nYou will need a certificate to run with current appsettings.json config"
printf "\nEither delete the certificate configuration and switch to HTTP"
printf "\nOr generate a key.pem and cert.pem using the command: \n\n openssl req -x509 -newkey rsa:4096 -keyout bin/out/key.pem -out bin/out/cert.pem -sha256 -days 365 -nodes \n"

printf "${GREEN}\nBuild Finished. See --> ${fullpath} ${NC}"