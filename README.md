# Setup

Install all package

```
npm i --legacy-peer-deps
```

Delete submodule spk_module

```
rm -rf spk_module
```

Add submodule spk_module

```
git submodule add https://github.com/Restu-Averian/EDAS_Winnowing.git spk_module
```

Migrate db

```
npx sequelize-cli db:migrate
```

Run project

```
npm start
```

Access service

```
http://localhost:3000
```

# API

API yang udah ada
a. <a href="doc:Mahasiswa" target="_blank">Mahasiswa</a>

## Mahasiswa

<table border=1>
    <tr>
        <th>No</th>
        <th>Endpoint</th>
        <th>Method</th>
        <th>Type</th>
        <th>Payload</th>
    </tr>
    <tr>
        <td>1</td>
        <td>/getAllMhs</td>
        <td>POST</td>
        <td rowSpan=2>Read</td>
        <td>
            <pre>
            {
                "page": 1
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>2</td>
        <td>/getMhsById</td>
        <td>POST</td>
        <td>
            <pre>
            {
                "no_bp": 1,
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>3</td>
        <td>/addMhs</td>
        <td>POST</td>
        <td rowSpan=2>Create</td>
        <td>
            <pre>
            {
                "no_bp": "",
                "name":"",
                "prodi":"",
                "tingkatan":"",
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>4</td>
        <td>/addMultipleDataMhs</td>
        <td>POST</td>
        <td>
            <pre>
            {
                "arrDatas": [ 
                    {
                        "no_bp": "",
                        "name": "",
                        "judul_acc": "",
                        "prodi": "",
                        "tingkatan": "",
                        "is_usul": false,
                    }],
                
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>5</td>
        <td>/updateDataMhs</td>
        <td>POST</td>
        <td rowSpan=2>Update</td>
        <td>
            <pre>
            {
                "page": 1,
                "category":1
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>6</td>
        <td>/updateMultipleDataMhs</td>
        <td>POST</td>
        <td>
            <pre>
            {
                "page": 1,
                "category":1
            }
            </pre>
        </td>
    </tr>
    <tr>
        <td>7</td>
        <td>/deleteDataMhs</td>
        <td>POST</td>
        <td rowSpan=1>Delete</td>
        <td>
            <pre>
            {
                "page": 1,
                "category":1
            }
            </pre>
        </td>
    </tr>
</table>
