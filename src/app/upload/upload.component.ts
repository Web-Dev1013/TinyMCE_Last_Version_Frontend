import { Component, OnInit } from '@angular/core';
import { VenderService } from './../vender.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

declare var tinyMCE: any;
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  host: {
    '(window:resize)': 'onResize($event)',
  },
})
export class UploadComponent implements OnInit {
  constructor(private venderService: VenderService) {
    this.initDefine = this.initDefine.bind(this);
    this.saveImageInfo = this.saveImageInfo.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  ngOnInit(): void {
    // Init Image data
    let subThis = this;
    tinyMCE
      .init({
        selector: '#editor',
        height: 400,
        menubar: ['file', 'edit', 'view', 'format', 'tools', 'table', 'help'],
        plugins: [
          'advlist autolink lists image link charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount',
        ],
        toolbar:
          'undo redo |\
          forecolor backcolor image|\
          bold italic underline strikethrough |\
          alignleft aligncenter alignright alignjustify |\
          insertfile media anchor codesample |\
          fontselect fontsizeselect | template formatselect |\
          outdent indent |  numlist bullist  charmap emoticons |\
          | fullscreen link pagebreak removeformat preview save print |\
          ltr rtl',
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        importcss_append: true,
        toolbar_sticky: true,
        template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
        template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
        image_caption: true,
        quickbars_selection_toolbar:
          'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image imagetools table',
        skin: this.useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: this.useDarkMode ? 'dark' : 'default',
        automatic_uploads: this.uploadFlag ? true : false,
        external_image_list_url: 'logo',
        paste_data_images: true,
        file_picker_types: 'image',
        location: subThis.imageUrl,
        file_picker_callback: function (callback: any, value: any, meta: any) {
          let url: string = subThis.imageUrl || '';
          (<HTMLInputElement>(
            document.querySelector('input[type=url]')
          )).value = url;
        },
        images_upload_handler: function (
          blobInfo: any,
          success: any,
          failure: any
        ) {
          window.localStorage.setItem(
            'blob',
            'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64()
          );
          success(
            'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64()
          );
        },
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
      })
      .then(function () {
        // Init define
        let imageBtn = <HTMLButtonElement>(
          document.querySelectorAll('.tox-tbtn')[6]
        );
        imageBtn.addEventListener('click', subThis.initDefine);
      });
  }

  uploadFlag: boolean = false;
  stateFlag: String = "false";
  initData: any[] = [];
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  useDarkMode: boolean = true;
  imageUrl?: string;
  fileInfos: any[] = [];
  imageName: string = '';
  imageSize: string = '';
  baseUrl: string = 'http://localhost:8080/api/files/';

  // init define function
  initDefine() {
    this.getListFiles();
    let subThis = this;
    setTimeout(function () {
      let initData: any = window.localStorage.getItem('initData');
      initData = JSON.parse(initData);
      setTimeout(function () {
        let imageSection = document.createElement('div');
        imageSection.setAttribute(
          'style',
          'overflow-y: auto; background: none'
        );
        imageSection.setAttribute('class', 'image-section');
        let uploadBtn = document.createElement('button');
        uploadBtn.setAttribute('class', 'btn btn-secondary upload_btn p-3');
        uploadBtn.addEventListener('click', (e) => {
          window.localStorage.setItem("replaceId", "0");
          subThis.uploadFunc();
        });
        uploadBtn.innerHTML = 'UPLOAD';
        let uploadFile = document.createElement('input');
        uploadFile.type = 'file';
        uploadFile.setAttribute('id', 'file');
        uploadFile.setAttribute(
          'style',
          'opacity: 0; position: absolute; top: 0'
        );
        uploadFile.addEventListener('change', (e) => {
          subThis.uploadImage(e);
        });
        let imageContents =
          '<div class="d-flex"><div class="upload"></div></div><div style="border-bottom:1px solid #151515"></div><div class="row" style="max-height: 300px">';
        initData.map(function (item: any, index: any) {
          imageContents +=
            '<div class="col-sm-4 d-flex mt-3"><div><div class="p-1 rounded-circle image_item d-flex"><img id="' + item._id + '" alt="' + item.title + '" style="width: 100px; height: 100px" src="assets/' + item.fileName + '" class="img-thumbnail img-fluid btn img_item" name="' + item.flag + '"></div><p id="caption_' + item._id + '" class="m-0 text-center btn d-block caption">' + item.caption + '</p></div><div class="btn remove-image"><svg width="24" height="24"><g fill-rule="nonzero"><path d="M19 4a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6c0-1.1.9-2 2-2h14zM5 6v12h14V6H5z"></path><path d="M14.4 8.6l1 1-2.3 2.4 2.3 2.4-1 1-2.4-2.3-2.4 2.3-1-1 2.3-2.4-2.3-2.4 1-1 2.4 2.3z"></path></g></svg></div></div>';
        });

        imageContents += '</div>';
        imageSection.innerHTML = imageContents;
        let modalBody = <HTMLDivElement>(
          document.querySelector('[role=tabpanel]')
        );

        setTimeout(() => {
          let captionBtn = document.querySelectorAll(".caption");
          for (var n = 0; n < captionBtn.length; n++) {
            captionBtn[n].addEventListener("click", subThis.changeCaption);
          }
        }, 100);

        modalBody.prepend(imageSection);
        if (!(<HTMLDivElement>document.querySelector('.image-caption'))) {
          let imageCaption = document.createElement('div');
          imageCaption.setAttribute('aria-disabled', 'false');
          imageCaption.setAttribute('class', 'tox-form__group');
          imageCaption.innerHTML =
            '<label class="tox-label" for="form-field_7218866513131616404863400">Image Caption</label><input type="text" tabindex="-1" data-alloy-tabstop="true" class="tox-textfield image-caption">';

          setTimeout(() => {
            let imageForm = <HTMLDivElement>(
              document.querySelector('.tox-dialog__body-content .tox-form')
            );
            if (imageForm.querySelector('.tox-icon.tox-checkbox-icon__unchecked')) {
              (<HTMLDivElement>(
                imageForm.querySelector('.tox-icon.tox-checkbox-icon__unchecked')
              )).click();
              imageForm
                .querySelector('.tox-form__grid.tox-form__grid--2col')
                ?.setAttribute('style', 'display: none');
              imageForm.appendChild(imageCaption);
            }
          }, 20);
        }

        let saveBtn = <HTMLButtonElement>document.querySelector('[title=Save]');
        saveBtn.addEventListener('click', subThis.saveImageInfo);

        (<HTMLButtonElement>document.querySelector('.upload')).appendChild(
          uploadBtn
        );
        (<HTMLButtonElement>document.querySelector('.upload')).appendChild(
          uploadFile
        );
        document
          .querySelector('[role=tabpanel]')
          ?.setAttribute('style', 'height: auto !important');
        document
          .querySelector('[role=dialog]')
          ?.setAttribute('style', 'max-width: 600px !important');

        var imageItem = document.querySelectorAll('.image_item img');
        for (var i = 0; i < imageItem.length; i++) {
          imageItem[i].addEventListener('click', function (e: any) {
            (<HTMLInputElement>document.querySelector('#file')).click();
            window.localStorage.setItem("replaceId", e.target.id);
            subThis.stateFlag = e.target.name;
          });
        }

        var removeImage = document.querySelectorAll(".remove-image");
        for (var j = 0; j < removeImage.length; j++) {
          removeImage[j].addEventListener("click", function (e: any) {
            if (confirm("Do you really want to delete?") == true) {
              subThis.removeImage(e);
            }
          });
        }
      }, 100);

      // if (window.localStorage.getItem("replaceId") == "0") {
      (<HTMLDivElement>(
        document.querySelector('.tox-dialog__body')
      )).addEventListener('click', function (e: any) {
        if (e.target.className == 'tox-dialog__body-nav-item tox-tab') {
          if (<HTMLDivElement>document.querySelector('.image-section')) {
            (<HTMLDivElement>document.querySelector('.image-section')).remove();

            setTimeout(() => {
              if (!(<HTMLDivElement>document.querySelector('.image-caption'))) {
                let imageCaption = document.createElement('div');
                imageCaption.setAttribute('aria-disabled', 'false');
                imageCaption.setAttribute('class', 'tox-form__group');
                imageCaption.innerHTML =
                  '<label class="tox-label" for="form-field_7218866513131616404863400">Image Caption</label><input type="text" tabindex="-1" data-alloy-tabstop="true" class="tox-textfield image-caption">';

                setTimeout(() => {
                  let imageForm = <HTMLDivElement>(
                    document.querySelector('.tox-form__group')
                  );
                  if (imageForm.querySelector('.tox-icon.tox-checkbox-icon__unchecked')) {
                    (<HTMLDivElement>(
                      imageForm.querySelector('.tox-icon.tox-checkbox-icon__unchecked')
                    )).click();
                    imageForm
                      .querySelector('.tox-checkbox')
                      ?.setAttribute('style', 'display: none');
                    imageForm.appendChild(imageCaption);
                  }
                }, 20);
              }
            }, 50);
            subThis.initDefine();
          }
        }
      });
      // }
    }, 200);
  }

  getListFiles(): void {
    this.venderService.getListFiles().subscribe(
      (res: any) => {
        let subThis = this;
        if (res.body != undefined) {
          subThis.initData = [];
          res.body.imageInfos.map(function (item: any, index: any) {
            subThis.initData.push(item);
          });
          window.localStorage.setItem(
            'initData',
            JSON.stringify(subThis.initData)
          );
        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  changeCaption(e: any) {
    let oldCaption = e.target.innerHTML;
    let oldImage = e.target.parentNode.firstChild.firstChild;
    let oldImageUrl = <HTMLInputElement>document.querySelectorAll(".tox-textfield")[0];
    oldImageUrl.value = "assets/" + oldImage.src.split("assets/")[1];
    (<HTMLInputElement>document.querySelectorAll(".tox-textfield")[1]).value = oldImage.alt;
    (<HTMLInputElement>document.querySelectorAll(".tox-textfield")[2]).value = "100";
    (<HTMLInputElement>document.querySelectorAll(".tox-textfield")[3]).value = "100";
    (<HTMLInputElement>document.querySelectorAll(".tox-textfield")[4]).value = oldCaption;
    window.localStorage.setItem("replaceId", oldImage.id);
    console.log("ID", window.localStorage.getItem("replaceId"));
    this.stateFlag = "true";
    oldImageUrl.setAttribute("readonly", "true");
  }


  uploadFunc() {
    (<HTMLInputElement>document.querySelector('#file')).click();
  }

  saveImageInfo() {
    var subThis = this;
    let fileName = <HTMLInputElement>(
      document.querySelectorAll('.tox-textfield')[0]
    );
    let altData = <HTMLInputElement>(
      document.querySelectorAll('.tox-textfield')[1]
    );
    let caption = <HTMLInputElement>(
      document.querySelectorAll('.tox-textfield')[4]
    );
    let replaceId = window.localStorage.getItem("replaceId");
    this.stateFlag = "true";

    setTimeout(function () {
      subThis.venderService
        .saveImageInfo(
          replaceId,
          fileName.value,
          altData.value,
          caption.value,
          subThis.stateFlag
        )
        .subscribe(
          (event: any) => {
            if (event) {
              let textContent = <HTMLIFrameElement>document.querySelector("#editor_ifr");
              let figCaption = textContent.contentWindow?.document.querySelectorAll("#tinymce figcaption");
              if (figCaption) {
                (<HTMLElement>figCaption[figCaption.length - 2]).innerHTML = caption.value;
              }
            }
          },
          (err: any) => {
          }
        );
    }, 100)
  }

  removeImage(e: any) {
    let selectedImage;
    if (e.target.tagName == "svg") {
      selectedImage = e.target.parentNode.parentNode.firstChild.firstChild.firstChild;
    } else if (e.target.tagName == "path") {
      selectedImage = e.target.parentNode.parentNode.parentNode.parentNode.firstChild.firstChild.firstChild;
    }
    let removeImageId: any = selectedImage.id;
    console.log(removeImageId)
    this.venderService.removeImage(removeImageId).subscribe(
      (event: any) => {
        if (event) {
          if (<HTMLDivElement>document.querySelector('.image-section')) {
            (<HTMLDivElement>(
              document.querySelector('.image-section')
            )).remove();
            setTimeout(() => {
              this.initDefine();
            }, 20);
          }
        }
      },
      (err: any) => {
        console.log(err);
      });
  }

  // Create upload button in tinyMCE plugin
  uploadImage(event: any) {
    this.selectedFiles = event.target.files;
    this.message = [];
    this.progressInfos = [];
    this.uploadFiles();
  }

  //uploading selected files
  uploadFiles(): void {
    this.message = [];
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
        this.imageName = this.selectedFiles[i].name;
        this.imageUrl = 'assets/' + this.selectedFiles[i].name;
        this.imageSize = this.selectedFiles[i].size + 'bytes';
      }
    }
  }

  //upload method
  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };
    this.imageUrl = '';
    if (file) {
      this.venderService.upload(file, window.localStorage.getItem("replaceId")).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(
              (100 * event.loaded) / event.total
            );
            if (<HTMLDivElement>document.querySelector('.image-section')) {
              (<HTMLDivElement>(
                document.querySelector('.image-section')
              )).remove();
              this.initDefine();
            }
          } else if (event instanceof HttpResponse) {
            const msg = 'Uploaded the file successfully: ' + file.name;
            this.message.push(msg);
            this.fileInfos.push({
              name: file.name,
              url: this.baseUrl + file.name,
            });
            if (<HTMLDivElement>document.querySelector('.image-section')) {
              (<HTMLDivElement>(
                document.querySelector('.image-section')
              )).remove();
              this.initDefine();
            }
            window.localStorage.setItem("replaceId", event.body);
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          const msg = 'Could not upload the file: ' + file.name;
          this.message.push(msg);
          this.fileInfos.push(file.name);
        }
      );
    }
  }

  onResize(event: any) {
    if (<HTMLDivElement>document.querySelector('.image-section')) {
      (<HTMLDivElement>document.querySelector('.image-section')).remove();
      this.initDefine();
    }
  }
}
