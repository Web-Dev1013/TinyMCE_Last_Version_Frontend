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
        images_upload_handler: function (blobInfo:any, success:any, failure:any) {
          window.localStorage.setItem("blob", 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
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
  initData: any[] = [];
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  useDarkMode: boolean = true;
  imageUrl?: string;
  replaceId: any = 0;
  fileInfos: any[] = [];
  image_type: string = '';
  image_name: string = '';
  image_size: string = '';
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
          subThis.replaceId = 0;
          subThis.uploadFunc();
        });
        uploadBtn.innerHTML = 'UPLOAD';
        // uploadBtn.addEventListener("click", subThis.uploadFunc);
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
            '<div class="col-sm-4 mt-3"><div class="p-1 image_item d-flex"><img id="' +
            item._id +
            '" style="width: 100px; height: 100px" src="assets/' +
            item.fileName +
            '" class="img-thumbnail img-fluid mx-auto btn img_item"></div></div>';
        });

        imageContents += '</div>';
        imageSection.innerHTML = imageContents;
        let modalBody = <HTMLDivElement>(
          document.querySelector('[role=tabpanel]')
        );
        modalBody.prepend(imageSection);
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

        var imageItem = document.querySelectorAll('.image_item');
        for (var i = 0; i < imageItem.length; i++) {
          imageItem[i].addEventListener('click', function (e: any) {
            (<HTMLInputElement>document.querySelector('#file')).click();
            subThis.replaceId = e.target.id;
          });
        }
      }, 100);

      (<HTMLDivElement>(
        document.querySelector('.tox-dialog__body')
      )).addEventListener('click', function (e: any) {
        if (e.target.className == 'tox-dialog__body-nav-item tox-tab') {
          if (<HTMLDivElement>document.querySelector('.image-section')) {
            (<HTMLDivElement>document.querySelector('.image-section')).remove();
            subThis.initDefine();
          }
        }
      });
    }, 200);
  }

  getListFiles(): void {
    this.venderService.getListFiles().subscribe(
      (res: any) => {
        const subThis = this;
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

  uploadFunc() {
    (<HTMLInputElement>document.querySelector('#file')).click();
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
        this.image_name = this.selectedFiles[i].name;
        this.imageUrl = 'assets/' + this.selectedFiles[i].name;
        this.image_type = this.selectedFiles[i].type;
        this.image_size = this.selectedFiles[i].size + 'bytes';
      }
    }
  }

  //upload method
  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };
    this.imageUrl = '';
    if (file) {
      this.venderService.upload(file, this.replaceId).subscribe(
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

  saveImage() {
    console.log('save', 123123123123);
  }

  onResize(event: any) {
    if (<HTMLDivElement>document.querySelector('.image-section')) {
      (<HTMLDivElement>document.querySelector('.image-section')).remove();
      this.initDefine();
    }
  }
}
