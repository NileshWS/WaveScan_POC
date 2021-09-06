import { fabric } from 'fabric';
const AWS = require('aws-sdk');
const electron = window.require('electron');
const remote = electron.remote
const { dialog } = remote
const path = remote.require('path');
const fs = remote.require('fs');

/**
 * Local docker image connection creds
 */
// const s3 = new AWS.S3({
//   accessKeyId: "minioadmin",
//   secretAccessKey: "minioadmin",
//   signatureVersion: 'v4',
//   endpoint: new AWS.Endpoint("http://127.0.0.1:9000"),
//   s3ForcePathStyle: true,
//   sslEnabled: false
// });

/**
 * remote server configuration: Personal Test Server
 */
const s3 = new AWS.S3({
    accessKeyId: "MinIOadmin",
    secretAccessKey: "MinIOadmin",
    signatureVersion: 'v4',
    endpoint: new AWS.Endpoint("http://68.183.93.166:9000"),
    s3ForcePathStyle: true,
    sslEnabled: false
});

const upload = (canvasInstance, nodeId) => {
    // If the platform is 'win32' or 'Linux'
    console.log(process.platform);
    if (process.platform !== 'darwin') {
        dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: 'Upload',
            filters: [{
                name: 'Image Files',
                extensions: ['png', 'jpg', 'jpeg']
            }],
            // Specifying the File Selector Property
            properties: ['openFile']
        }).then(file => {
            // Stating whether dialog operation was
            // cancelled or not.
            console.log(file.canceled);
            console.log(file);
            if (!file.canceled) {
                // Updating the GLOBAL filepath variable
                // to user-selected file.
                global.filepath = file.filePaths[0].toString();
                const filepath = file.filePaths[0].toString();
                const key = `${nodeId}.${filepath.split('.').pop()}`;
                console.log(key);
                addFileToBucketAndCanvas(canvasInstance, filepath, key);
            }
        }).catch(err => {
            console.log(err)
        });
    }
    else {
        // If the platform is 'darwin' (macOS)
        dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: 'Upload',
            filters: [{
                name: 'Image Files',
                extensions: ['png', 'jpg', 'jpeg']
            }],
            // Specifying the File Selector and Directory
            // Selector Property In macOS
            properties: ['openFile', 'openDirectory']
        }).then(file => {
            console.log(file.canceled);
            if (!file.canceled) {
                global.filepath = file.filePaths[0].toString();
                const filepath = file.filePaths[0].toString();
                const key = `${nodeId}.${filepath.split('.').pop()}`;
                addFileToBucketAndCanvas(canvasInstance, filepath, key);
            }
        }).catch(err => {
            console.log(err)
        });
    }
};

const addFileToBucketAndCanvas = (canvasInstance, file, key) => {
    const fileContent = fs.readFileSync(file);

    // Setting up S3 upload parameters
    const params = {
        Bucket: "astar",
        Key: key, // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        fabric.Image.fromURL(`${data.Location}`, (oImg) => {
            canvasInstance.add(oImg);
        });
    });
};


const deleteFile = (key) => {
    const params = {
        Bucket: "images",
        Key: key, // File name you want to save as in S3
    };

    s3.deleteObject(params, (err, data) => {
        if (err) {
            throw err;
        }
        console.log('file deleted successfully. ', data);
    })
}

export {
    upload
};

/**
 * references
 * https://docs.aws.amazon.com/code-samples/latest/catalog/javascript-s3-s3_photoExample.js.html
 * https://www.youtube.com/watch?v=6GpaNOYvZCE
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
 */

/**
 * MinIO Docker installation reference
 * https://docs.min.io/docs/minio-docker-quickstart-guide.html
 * https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-centos-7
 * https://docs.docker.com/engine/install/centos/
 */
