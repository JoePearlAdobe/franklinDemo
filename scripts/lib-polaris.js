
var polarisImgs = new Array();
const polarisImageTitle = '~polaris-title~';
const polarisImageTag = '~polaris-tag~';

export function decoratePolarisImage(element) {
    findAllPolarisImages(element);
    polarisImgs.forEach(polarisImg => console.log(polarisImgs.assetId));
    decorateAllPolarisImages(polarisImgs);
}

function findAllPolarisImages (element){
    element.querySelectorAll('p').forEach((para) => {
        if (polarisImageTitle === para.innerHTML || polarisImageTag === para.innerHTML) {
            // console.log('found polaris image', para);
            // get the alt attribute of the nearest image tag above this html tag
            const closestImg = para.parentElement.querySelector('img');
            if (closestImg !== null) {
                // check if valid alt attribute
                var altText = closestImg.getAttribute('alt');
                if (altText) {
                    var jsonObj = JSON.parse(altText);
                    const assetId = getAltAttr(jsonObj, 'assetId');
                    const repoId = getAltAttr(jsonObj, 'repositoryId');
                    if (assetId && repoId && testAssetId(assetId)) {
                        // console.log('found valid polaris data - repoId :' ,repoId,' assetId :', assetId);
                        polarisImgs.push({ assetId: assetId, repoId: repoId, paraEle: para, paraType: para.innerHTML});
                    }
                }
            }
        }
    });
}

function decorateAllPolarisImages(){
    polarisImgs.forEach( (polarisImg) => {
        fetchAssetMetadata(polarisImg.assetId, polarisImg.repoId).then(resp => {
            console.log(resp);
            var jsonStr = JSON.stringify(resp);
            var jsonObj = JSON.parse(jsonStr);
            var val = parsePolarisResponse(jsonObj, polarisImg.paraType);
            polarisImg.paraEle.innerHTML = val;
        });
        //  var sampleJson = sampleResponse();
        //   var titleVal = parsePolarisMetadataResponse(sampleJson,'title');
        //   para.innerHTML = titleVal;
    });
}

function getAltAttr(altJson,prop){
        return altJson[prop];
}

async function fetchAssetMetadata(assetId, repoId){
    const polarisMetadataApiEndPoint = 'https://polarisnew-dev-va7.stage.cloud.adobe.io/adobe/approvedassets/metadata/';
    const headers = {
        'x-sky-polaris-release': repoId,
    };
    var url = polarisMetadataApiEndPoint + assetId;
    const response = await fetch(url, { headers });
    const resp = await response.json();
    return resp;
}

function parsePolarisResponse(jsonOutput, attr) {
    var attrVal = '';
    if (jsonOutput) {
        if(attr === polarisImageTitle && jsonOutput['embedded'] && jsonOutput['embedded']['dc:title']){
             attrVal = 'Title - ' + jsonOutput['embedded']['dc:title'];
        } else if (attr === polarisImageTag){

            if(jsonOutput['application'] && jsonOutput['application']['xcm:machineKeywords']) {
                var keywords = jsonOutput['application']['xcm:machineKeywords'];
                if(keywords){
                    attrVal = 'Tags - ';
                    if (keywords[0] && keywords[0]['value'])
                        attrVal = attrVal + keywords[0]['value'];
                    if (keywords[1] && keywords[1]['value'])
                        attrVal = attrVal + ', ' + keywords[1]['value'];
                    if (keywords[2] && keywords[2]['value'])
                        attrVal = attrVal + ', ' + keywords[2]['value'];
                }
            }
        }
    }
    return attrVal;
}

function testAssetId(assetId){
    const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    return re.test(assetId);
}
