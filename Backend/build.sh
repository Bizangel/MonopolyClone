#!/bin/bash
cd "$(dirname "$0")"

dotnet publish

#dotnet publish --os linux --arch x64

rm -rf bin/out # clean previous output

cp bin/Debug/net6.0/publish bin/out -R # make our own folder for output, leave Debug be

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

## copy NLog production instead of dev one
# cp NLog.production.config bin/out/NLog.config

## Generate frontend files and move them to folder
cd ../Frontend/
if [ -d "build" ]; then
    echo "build React output folder already exists! Simply copying. Delete and rerun to rebuild it or rebuild it manually."
else
    echo "Build folder from react is not present, building..."
    npm run build
fi

cp build ../Backend/bin/out/static -R
fullpath=$(realpath ../Backend/bin/out)


echo "\n This build was compiled for linux x64 systems. Modify the first line of build.sh to change this\n"
echo "Build Finished. See --> ${fullpath}"

