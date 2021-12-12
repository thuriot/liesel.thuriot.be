# docker build -t build-steventhuriot:1.0 .
docker run --name BuildJekyll -v ${pwd}:/usr/src/app --rm -it build-steventhuriot:1.0

Set-Location _site

Remove-Item build.sh -Force
Remove-Item Dockerfile -Force
Remove-Item commit.ps1 -Force

git init
git remote add upstream "https://github.com/thuriot/steven.thuriot.be.git"

git fetch upstream && git reset upstream/gh-pages

Write-Output $null >> .nojekyll
Write-Output "steven.thuriot.be" > CNAME

git add -A .
git commit -m "Rebuild pages"
git push -q upstream HEAD:gh-pages

Set-Location ..
Remove-Item -LiteralPath _site -Force -Recurse

git add -A .
git commit -m "Updated website"
git push