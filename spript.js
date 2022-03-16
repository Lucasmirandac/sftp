const Client = require('ssh2-sftp-client');
const { exec } = require("child_process");

const config = {
    host: process.env.HOST,
    port: process.env.PORT,
    username: process.env.SFTP_USER,
    password: process.env.FTP_PASSWORD
};

const sftp = new Client();

//list of all folders that finish with *_HI
// with the list above enter in all folders and download the files
//after that zip files and delete files from 2020 and 2021
//then upload the zip files to the remote folder
async function donwloadAndZipFiles() {
    try {
        await sftp.connect(config)

        foldersList = await sftp.list('/loghist', '*_HI');
        for (const key of foldersList) {
            var localPath = '/home/lucas/Downloads/ftp/';
            var specificFolderName = key.name;
            remoteFiles = await sftp.list('/loghist/' + key.name);

            for (const file of remoteFiles) {
                if (file.name.startsWith("2020" || file.name.startsWith("2021") && !file.name.endsWith(".gz"))) {
                    useFile = file.name
                    var remotePath = '/loghist/' + specificFolderName + '/' + useFile
                    localPath = '/home/lucas/Downloads/ftp/' + useFile
                    console.log(remotePath)
                    var fileBuffer = await sftp.get(remotePath, localPath);
                    zipFile(useFile);
                    await sftp.delete(remotePath)
                    await sftp.put(fileBuffer)
                }

            }
        }
    } catch (error) {
        console.log(error)
    }
}

function zipFile(fileName) {
    console.log(__dirname)
    exec(`zip -r ../../Downloads/ftp/${fileName.replace(".txt", ".zip")} ../../Downloads/ftp/${fileName}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

donwloadAndZipFiles()