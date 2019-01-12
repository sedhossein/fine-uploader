
window.onload = function () {}
// *shh* get uuid and return child id if exist
// if not exist return null
// search in indexes(keys)
function get_child_uuid(_uuid) { // _uuid is parent uuid
    _uuid = String(_uuid);
    return (_uuid in qq.uuid_pivot) ? qq.uuid_pivot[_uuid] : '';
}

// *shh* get child uuid and return parent id
// if not exist return null
function get_parent_uuid(_uuid) {
    _uuid = String(_uuid);
    for(var key in qq.uuid_pivot){
        if(qq.uuid_pivot[key] == _uuid)
            return key;
    }
    return '';
}


// <bms : this script is used in exhibitation request till line 450 and so>
var url_string = window.location.href;
var url = new URL(url_string);
var box_id = url.searchParams.get("rel");

var Video = [];
var Photoes = [];
var Photo = [];

var VideoName = [];
var PhotoesName = [];
var PhotoName = [];

var VideoThumbnailUrl = [];
var PhotoesThumbnailUrl = [];
var PhotoThumbnailUrl = [];

var TN_Photoes = [];
var TN_Photo = [];

var TN_PhotoesName = [];
var TN_PhotoName = [];

var TN_PhotoesThumbnailUrl = [];
var TN_PhotoThumbnailUrl = [];

//*shh*   more details about fp_photos & fp_photoes
var child_uuids = []; // just main photos have this and used with `PhotoXXX` arrays
var paretn_uuids = []; //just thumbnails have these field and used with `TN_PhotoXXX` arrays


if ($('#addAdsGetVideo').length > 0) {

    var addAdsGetVideo = new qq.FineUploader({
        element: document.getElementById("addAdsGetVideo"),
        template: 'qq-template-gallery',
        request: {
            endpoint: '/uploads/endpoint.php',
            params: {'box_id': box_id}
        },
        session: {
            endpoint: '/supply/get-video',
            params: {'fpid': box_id}
        },
        deleteFile: {
            enabled: true,
            forceConfirm: true,
            endpoint: '/uploads/endpoint.php'
        },
        thumbnails: {
            placeholders: {
                waitingPath: '/images/placeholders/waiting-generic.png',
                notAvailablePath: '/images/placeholders/not_available-generic.png'
            }
        },
        validation: {
            allowedExtensions: ['mp4', 'mov', 'avi', '3gp'],
            sizeLimit: 11000000,
            itemLimit: 1
        },
        callbacks: {
            onComplete: function (id, fileName, responseJSON) {
                Video.push(responseJSON.uuid);
                VideoName.push(responseJSON.uploadName);
                thumbnailUrl = '/uploads/files/' + responseJSON.uuid + '/' + responseJSON.uploadName;
                VideoThumbnailUrl.push(responseJSON.thumbnailUrl);
                Array.prototype.zip = function (arr, arr2) {
                    return this.map(function (e, i) {
                        return [e, arr[i], arr2[i]];
                    })
                };
                var verticalMergedArray = Video.zip(VideoName, VideoThumbnailUrl);
                var jsonObj = [];
                for (var i = 0; i < verticalMergedArray.length; i++) {
                    var temp = {};
                    temp['uuid'] = verticalMergedArray[i][0];
                    temp['name'] = verticalMergedArray[i][1];
                    temp['thumbnailUrl'] = verticalMergedArray[i][2];
                    jsonObj.push(temp);
                }
                var jsonArray = JSON.stringify(jsonObj);
                $("input[name='SupplyRegistrationFrom[fp_video]']")[0].setAttribute('value', jsonArray);

            },
            onUpload: function (id, fileName) {
            },
            onDelete: function (id) {
                // this._netUploadedOrQueued = this._netUploadedOrQueued -1 ;
                this.setDeleteFileParams({filename: this.getName(id)}, id);

                //bms: get the photo name, notic that in ui mode there is the id generated for every session that represented tumnnail
                var uuid = this.getUuid(id);
                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[fp_video]']")[0].getAttribute('value'));
                // var uuidForPop;
                // var tumbForPop;

                //bms: remove desired entry from javascript object
                var newAttr = $.grep(getAttr, function (e) {
                    // uuidForPop = e.uuid;
                    // tumbForPop = e.thumbnailUrl;
                    return e.uuid == uuid;

                }, true);

                var deleted = $.grep(getAttr, function (e) {
                    // uuidForPop = e.uuid;
                    // tumbForPop = e.thumbnailUrl;
                    return e.uuid == uuid;
                });

                var jsonArray = JSON.stringify(newAttr);
                $("input[name='SupplyRegistrationFrom[fp_video]']")[0].setAttribute('value', jsonArray);

                deleted.forEach(function (element) {
                    Video = $.grep(Video, function (value) {
                        return value != element.uuid;
                    });
                    VideoName = $.grep(VideoName, function (value) {
                        return value != element.name;
                    });
                    VideoThumbnailUrl = $.grep(VideoThumbnailUrl, function (value) {
                        return value != element.thumbnailUrl;
                    });
                });
            }
        },
    });

    // second one
    var addAdsGetPhotoes = new qq.FineUploader({
        element: document.getElementById("addAdsGetPhotoes"),
        template: 'qq-template-gallery',
        request: {
            endpoint: '/uploads/endpoint.php',
            params: {'box_id': box_id}
        },
        session: {
            endpoint: '/supply/get-photos',
            params: {'fpid': box_id}
        },
        deleteFile: {
            enabled: true,
            forceConfirm: true,
            endpoint: '/uploads/endpoint.php',
        },
        thumbnails: {
            placeholders: {
                waitingPath: '/images/placeholders/waiting-generic.png',
                notAvailablePath: '/images/placeholders/not_available-generic.png'
            }
        },
        validation: {
            allowedExtensions: ['jpeg', 'jpg', 'gif', 'png'],
            sizeLimit: 5242880,
            itemLimit: 12,
            allowEmpty: false,
            minSizeLimit: 30000
        },
        callbacks: {
            onComplete: function (id, fileName, responseJSON) {

                var uuid = this.getUuid(id);
                // the file name is changed here, but the new file name is in "responseJSON.uploadName" and
                if (fileName.includes("small")) {
                    // <bms: step2 -> push new items identification parts in corresponding array to aggregate with previous data>
                    TN_Photoes.push(responseJSON.uuid);
                    TN_PhotoesName.push(responseJSON.uploadName);
                    thumbnailUrl = '/uploads/files/' + responseJSON.uuid + '/' + responseJSON.uploadName;
                    TN_PhotoesThumbnailUrl.push(thumbnailUrl);
                    paretn_uuids.push( get_parent_uuid(responseJSON.uuid) );
                    // child_uuids.push( '' );//get_child_uuid(responseJSON.uuid)

                    Array.prototype.zip = function (arr, arr2, arr3) {//, arr4
                        return this.map(function (e, i) {
                            return [e, arr[i], arr2[i] ,arr3[i]];//, arr4[i]
                        })
                    };

                    var verticalMergedArray = TN_Photoes.zip(TN_PhotoesName, TN_PhotoesThumbnailUrl ,paretn_uuids );//,child_uuids

                    var jsonObj = [];
                    for (var i = 0; i < verticalMergedArray.length; i++) {
                        var temp = {};
                        temp['uuid'] = verticalMergedArray[i][0];
                        temp['name'] = verticalMergedArray[i][1];
                        temp['thumbnailUrl'] = verticalMergedArray[i][2];
                        temp['parent_id'] = verticalMergedArray[i][3];
                        // temp['child_id'] = verticalMergedArray[i][4];
                        jsonObj.push(temp);
                    }

                    var jsonArray = JSON.stringify(jsonObj);

                    $("input[name='SupplyRegistrationFrom[tn_fp_photoes]']")[0].setAttribute('value', jsonArray);
                } else {

                    // <bms: step2 -> push new items identification parts in corresponding array to aggregate with previous data>
                    Photoes.push(responseJSON.uuid);
                    PhotoesName.push(responseJSON.uploadName);
                    thumbnailUrl = '/uploads/files/' + responseJSON.uuid + '/' + responseJSON.uploadName;
                    PhotoesThumbnailUrl.push(thumbnailUrl);
                    child_uuids.push( get_child_uuid(responseJSON.uuid) );

                    Array.prototype.zip = function (arr, arr2, arr3) {//, arr4
                        return this.map(function (e, i) {
                            return [e, arr[i], arr2[i] ,arr3[i]];//, arr4[i]
                        })
                    };

                    var verticalMergedArray = Photoes.zip(PhotoesName, PhotoesThumbnailUrl, child_uuids);// paretn_uuids,
                    var jsonObj = [];

                    for (var i = 0; i < verticalMergedArray.length; i++) {
                        var temp = {};
                        temp['uuid'] = verticalMergedArray[i][0];
                        temp['name'] = verticalMergedArray[i][1];
                        temp['thumbnailUrl'] = verticalMergedArray[i][2];
                        // temp['parent_id'] = verticalMergedArray[i][3];
                        temp['child_id'] = verticalMergedArray[i][3];//[4]
                        jsonObj.push(temp);
                    }
                    var jsonArray = JSON.stringify(jsonObj);

                    $("input[name='SupplyRegistrationFrom[fp_photoes]']")[0].setAttribute('value', jsonArray);
                }

            },
            onUpload: function (id, fileName) {
            },

            onSessionRequestComplete: function (response, success, xhrOrXdr) {
                // <bms: get previous items and put thers associate parts in correspponding array>
                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[fp_photoes]']")[0].getAttribute('value'));
                if ( getAttr!==null && getAttr.length > 0) {
                    getAttr.forEach(function (element) {
                        Photoes.push(element.uuid);
                        PhotoesName.push(element.name);
                        PhotoesThumbnailUrl.push(element.thumbnailUrl);
                        child_uuids.push( element.child_id );
                    })
                }

                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[tn_fp_photoes]']")[0].getAttribute('value'));
                if ( getAttr!==null && getAttr.length > 0) {
                    getAttr.forEach(function (element) {
                        TN_Photoes.push(element.uuid);
                        TN_PhotoesName.push(element.name);
                        TN_PhotoesThumbnailUrl.push(element.thumbnailUrl);
                        paretn_uuids.push( element.parent_id );
                    })
                }
            },
            onDelete: function (id) {

                this._netUploadedOrQueued = this._netUploadedOrQueued - 2
                this.setDeleteFileParams({filename: this.getName(id)}, id);
                var uuid = this.getUuid(id);

                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[fp_photoes]']")[0].getAttribute('value'));

                var newAttr = $.grep(getAttr, function (e) {
                    return e.uuid == uuid  ;// e.uuid == get_child_uuid(uuid)
                }, true);
                var deleted = $.grep(getAttr, function (e) {
                    return e.uuid == uuid ;
                });
                var jsonArray = JSON.stringify(newAttr);

                deleted.forEach(function (element) {
                    Photoes = $.grep(Photoes, function (value) {
                        return value != element.uuid;
                    });
                    PhotoesName = $.grep(PhotoesName, function (value) {
                        return value != element.name;
                    });
                    PhotoesThumbnailUrl = $.grep(PhotoesThumbnailUrl, function (value) {
                        return value != element.thumbnailUrl;
                    });
                    child_uuids = $.grep(child_uuids, function (value) {
                        return value != element.child_id;
                    });
                });
                $("input[name='SupplyRegistrationFrom[fp_photoes]']")[0].setAttribute('value', jsonArray);

// todo : check get_child functions and deleted var
                // thumbnails
                this._netUploadedOrQueued = this._netUploadedOrQueued - 2
                this.setDeleteFileParams({filename: this.getName(id)}, id);
                var uuid = this.getUuid(id);
                // _buffer_parent_id = get_parent_uuid(uuid);
                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[tn_fp_photoes]']")[0].getAttribute('value'));

                var newAttr = $.grep(getAttr, function (e) {
                    return e.uuid == get_child_uuid(uuid);
                }, true);
                var deleted = $.grep(getAttr, function (e) {
                    return e.uuid == get_child_uuid(uuid);
                });
                var jsonArray = JSON.stringify(newAttr);

                deleted.forEach(function (element) {
                    TN_Photoes = $.grep(Photoes, function (value) {
                        return value != element.uuid;
                    });
                    TN_PhotoesName = $.grep(PhotoesName, function (value) {
                        return value != element.name;
                    });
                    TN_PhotoesThumbnailUrl = $.grep(PhotoesThumbnailUrl, function (value) {
                        return value != element.thumbnailUrl;
                    });
                    paretn_uuids = $.grep(paretn_uuids, function (value) {
                        return value != element.paretn_id;
                    });
                    console.log(paretn_uuids);

                });
                $("input[name='SupplyRegistrationFrom[tn_fp_photoes]']")[0].setAttribute('value', jsonArray);
            },
        },

        scaling: {
            hideScaled: true,
            sizes: [
                {name: "small", maxSize: 300},
                // {name: "medium", maxSize: 300}
            ]
        }
    });

    //and the third
    var addAdsGetMainPhotoe = new qq.FineUploader({
        element: document.getElementById("addAdsGetMainPhotoe"),
        template: 'qq-template-gallery',
        request: {
            endpoint: '/uploads/endpoint.php',
            params: {'box_id': box_id},
            chunking: {
                enabled: false,
                concurrent: {
                    enabled: true
                },
                success: {
                    endpoint: "endpoint.php?done",
                }
            }
        },
        session: {
            endpoint: '/supply/get-photo',
            params: {'fpid': box_id}
        },
        display: {
            prependFiles: true,
            fileSizeOnSubmit: true
        },
        deleteFile: {
            enabled: true,
            // forceConfirm: true,
            endpoint: '/uploads/endpoint.php'
        },
        thumbnails: {
            placeholders: {
                waitingPath: '/images/placeholders/waiting-generic.png',
                notAvailablePath: '/images/placeholders/not_available-generic.png'
            }
        },
        validation: {
            allowedExtensions: ['jpeg', 'jpg', 'gif', 'png'],
            sizeLimit: 5242880,
            itemLimit: 2,
            minSizeLimit: 30000,
            autoUpload: false,
            allowEmpty: false
        },

        editFilename: {
            enabled: true
        },
        callbacks: {
            onComplete: function (id, fileName, responseJSON) {
                if (fileName.includes("small")) {

                    TN_Photo.push(responseJSON.uuid);
                    TN_PhotoName.push(responseJSON.uploadName);
                    thumbnailUrl = '/uploads/files/' + responseJSON.uuid + '/' + responseJSON.uploadName;
                    TN_PhotoThumbnailUrl.push(thumbnailUrl);

                    paretn_uuids.push( get_parent_uuid(responseJSON.uuid) );

                    Array.prototype.zip = function (arr, arr2,arr3) {
                        return this.map(function (e, i) {
                            return [e, arr[i], arr2[i], arr3[i]];
                        })
                    };
                    var verticalMergedArray = TN_Photo.zip(TN_PhotoName, TN_PhotoThumbnailUrl,paretn_uuids);
                    var jsonObj = [];
                    for (var i = 0; i < verticalMergedArray.length; i++) {
                        var temp = {};
                        temp['uuid'] = verticalMergedArray[i][0];
                        temp['name'] = verticalMergedArray[i][1];
                        temp['thumbnailUrl'] = verticalMergedArray[i][2];
                        temp['parent_id'] = verticalMergedArray[i][3];

                        jsonObj.push(temp);
                    }
                    var jsonArray = JSON.stringify(jsonObj);

                    $("input[name='SupplyRegistrationFrom[tn_fp_photo]']")[0].setAttribute('value', jsonArray);
                } else {

                    Photo.push(responseJSON.uuid);
                    PhotoName.push(responseJSON.uploadName);
                    thumbnailUrl = '/uploads/files/' + responseJSON.uuid + '/' + responseJSON.uploadName;
                    PhotoThumbnailUrl.push(thumbnailUrl);
                    child_uuids.push( get_child_uuid(responseJSON.uuid) );

                    Array.prototype.zip = function (arr, arr2, arr3) {
                        return this.map(function (e, i) {
                            return [e, arr[i], arr2[i], arr3[i]];
                        })
                    };

                    var verticalMergedArray = Photo.zip(PhotoName, PhotoThumbnailUrl , child_uuids);
                    var jsonObj = [];
                    for (var i = 0; i < verticalMergedArray.length; i++) {
                        var temp = {};
                        temp['uuid'] = verticalMergedArray[i][0];
                        temp['name'] = verticalMergedArray[i][1];
                        temp['thumbnailUrl'] = verticalMergedArray[i][2];
                        temp['child_id'] = verticalMergedArray[i][3];//[4]

                        jsonObj.push(temp);
                    }
                    var jsonArray = JSON.stringify(jsonObj);

                    $("input[name='SupplyRegistrationFrom[fp_photo]']")[0].setAttribute('value', jsonArray);
                }

            },
            onError: function (id, name, errorReason, xhrOrXdr) {
                alert(qq.format("Error on file number {} - {}.  Reason: {}", id, name, errorReason));
            },
            onUpload: function (id, fileName) {
            },
            onDelete: function (id) {

                this._netUploadedOrQueued = this._netUploadedOrQueued - 1;
                this.setDeleteFileParams({filename: this.getName(id)}, id);
                var uuid = this.getUuid(id);

                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[fp_photo]']")[0].getAttribute('value'));
                var newAttr = $.grep(getAttr, function (e) {
                    return e.uuid == uuid;
                }, true);
                var deleted = $.grep(getAttr, function (e) {
                    return e.uuid == uuid;
                });
                var jsonArray = JSON.stringify(newAttr);

                $("input[name='SupplyRegistrationFrom[fp_photo]']")[0].setAttribute('value', jsonArray);

                deleted.forEach(function (element) {
                    Photo = $.grep(Photo, function (value) {
                        return value != element.uuid;
                    });
                    PhotoName = $.grep(PhotoName, function (value) {
                        return value != element.name;
                    });
                    PhotoThumbnailUrl = $.grep(PhotoThumbnailUrl, function (value) {
                        return value != element.thumbnailUrl;
                    });
                    child_uuids = $.grep(child_uuids, function (value) {
                        return value != element.child_id;
                    });
                });

                // clear thumbnail input
                this._netUploadedOrQueued = this._netUploadedOrQueued - 1;
                this.setDeleteFileParams({filename: this.getName(id)}, id);
                var uuid = this.getUuid(id);
                // uuid = get_child_uuid(uuid);

                var getAttr = JSON.parse($("input[name='SupplyRegistrationFrom[tn_fp_photo]']")[0].getAttribute('value'));

                var newAttr = $.grep(getAttr, function (e) {
                    return e.uuid == get_child_uuid(uuid);
                }, true);
                var deleted = $.grep(getAttr, function (e) {
                    return e.uuid == get_child_uuid(uuid);
                });

                var jsonArray = JSON.stringify(newAttr);

                deleted.forEach(function (element) {

                    TN_Photo = $.grep(Photoes, function (value) {
                        return value != element.uuid;
                    });

                    TN_PhotoName = $.grep(PhotoesName, function (value) {
                        return value != element.name;
                    });

                    TN_PhotoThumbnailUrl = $.grep(PhotoesThumbnailUrl, function (value) {
                        return value != element.thumbnailUrl;
                    });

                    paretn_uuids = $.grep(paretn_uuids, function (value) {
                        return value != element.parent_id;
                    });

                });
                $("input[name='SupplyRegistrationFrom[tn_fp_photo]']")[0].setAttribute('value', jsonArray);

            },
            onSessionRequestComplete: function (response, success, xhrOrXdr) {

            }
        },
        scaling: {
            // sendOriginal:false,
            hideScaled: true,
            sizes: [
                {name: "small", maxSize: 300},
                // {name: "org", maxSize: 800}
            ]
        }

    });

}
