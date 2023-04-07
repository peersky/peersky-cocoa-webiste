```
yarn hardhat upload2IPFS --path assets/Banana\ cream\ chocklate.png
yarn run v1.22.18
$  upload2IPFS --path 'assets/Banana cream chocklate.png'
{
  path: 'QmbphEtVT2p4eSc15ntpdFjbEid3AE3Z9vJZLrps9Eqqyb',
  cid: CID(QmbphEtVT2p4eSc15ntpdFjbEid3AE3Z9vJZLrps9Eqqyb),
  size: 5725055
}
```

```
yarn hardhat uploadDir2IPFS --path assets/10v3
yarn run v1.22.18
$ uploadDir2IPFS --path assets/10v3
path:  assets/10v3
{
  path: '10v3/1',
  cid: CID(QmebsJbzHSDNW71zqj9LHo1xmGnzGF89KvgUzdRJWf72Xb),
  size: 441
}
{
  path: '10v3',
  cid: CID(QmRMxVd1SSajhKrCNWQcpHPQdBoMsBfA2XwZyV278LdJK2),
  size: 489
}
```

```
# compressed version:
upload2IPFS --path 'assets/Banana cream chocklate.png'
{
  path: 'Qmb1pjVxE1oNBTFEroR2UMvjKunCzptBj46RSPa2gW4HPG',
  cid: CID(Qmb1pjVxE1oNBTFEroR2UMvjKunCzptBj46RSPa2gW4HPG),
  size: 407532
}
```

```
uploadDir2IPFS --path assets/10v3
path:  assets/10v3
{
  path: '10v3/1',
  cid: CID(QmZrcnYth5U5BMKL6mioK54id31Sqt5Zebc27xgpv8S4Lz),
  size: 441
}
{
  path: '10v3',
  cid: CID(QmYo8nhfgRzMvM1uxv51Q2Ctbe39BGacnsRi8bhYQNXYwT),
  size: 489
}
```

yarn hardhat uploadDir2IPFS --path assets/sun
yarn run v1.22.19
path: assets/sun
{
path: 'sun/1',
cid: CID(QmdZvc662NhzXrkWWc752P7R5CFV8b76Q242B4mfTdJTNS),
size: 185
}
{
path: 'sun',
cid: CID(QmZZaGX1jaMtMpbuU5q7PBqpjqEy8SPLjSbV2HhtFjKtvg),
size: 233
}
