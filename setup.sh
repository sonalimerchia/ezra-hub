if [ $1 ]
then
cd dist
cd config
rm user.json
touch user.json
echo "{\"id\": \"$1\"}" > user.json
cd ..
cd ..
fi