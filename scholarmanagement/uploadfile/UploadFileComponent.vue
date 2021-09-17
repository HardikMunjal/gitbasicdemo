<template>
  <div class="content-container">
  <div class="uplaod-section">
    <div>
      <div
        :class="{ 'uplaod-section-box-error': maxFileSizeFlag === false, 'uplaod-section-box' : true, 'upload-error-box': ((!maxFileSizeFlag) && (!isCsvFileUploaded) && (isFileSelected) && (!isFileCorrect))}"
      >
        <div class="loading" v-if="(isFileSelected && maxFileSizeFlag && isFileCorrect)">
          <p bx-attr="csv-uploaded-loading">{{getScreenText("CSV_UPLOADED_LOADING")}}</p>
        </div>
        <vue-dropzone
          ref="myVueDropzone"
          :include-styling="false"
          :useCustomSlot="true"
          id="dropzone"
          class="dropzone upload-file"
          
          @vdropzone-upload-progress="uploadProgress"
          v-on:vdropzone-sending="sendingFiles"
          :options="dropzoneOptions"
          @vdropzone-file-added="fileAdded"
          @vdropzone-success="success"
          @vdropzone-error="onError"
          bx-attr="roaster-myVueDropzone"
        >
          <div class="dropzone-custom-content">
            <div
              class="success-handler"
              v-if="((isCsvFileUploaded && maxFileSizeFlag) && (!isFileSelected) )"
            >
              <em class="check-icon">
                <img bx-attr="checkright-img" src="../../../assets/images/scholars/add-new-scholars/checkright.svg" alt />
              </em>
              <div class="uplaod-section-info">
                <span bx-attr="success-message" class="header_title">{{getScreenText("CSV_UPLOADED_SUCCESS")}}</span>
                <span bx-attr="success-fileName" class="file_name">{{currentCsvFileName}}</span>
                <a
                  class="delete-icon"
                  :class="disableDelete && 'disable-delete'"
                  @click="removeCurrentSelection()"
                  href="javascript:void(0)"
                bx-attr="roaster-myVueDropzone-delete">
                  <img src="../../../assets/images/scholars/add-new-scholars/delete.svg" alt />
                </a>
              </div>
            </div>
            <div
              class="csv-error-handler"
              v-if="((maxFileSizeFlag) && (!isCsvFileUploaded) && (isFileSelected) && (!isFileCorrect))"
            >
              <em class="check-icon">
                <img bx-attr="error-img" src="../../../assets/images/scholars/add-new-scholars/error.svg" alt />
              </em>
              <div class="uplaod-section-info">
                <span bx-attr="error-msg" class="error-msg">{{getScreenText("CSV_UPLOADED_ERROR_FILE")}}</span>
              </div>
            </div>
            <div v-if="((!maxFileSizeFlag) && (!isCsvFileUploaded) && (isFileSelected))">
              <em class="check-icon">
                <img bx-attr="error-img1" src="../../../assets/images/scholars/add-new-scholars/error.svg" alt />
              </em>
              <div class="uplaod-section-info">
                <p bx-attr="file-exceeded-text1">{{getScreenText("CSV_UPLOADED_FILE_EXCEEDED_TEXT1")}}</p>
                <p bx-attr="file-exceeded-text2">{{getScreenText("CSV_UPLOADED_FILE_EXCEEDED_TEXT2")}}</p>
                <p bx-attr="file-exceeded-text3">{{getScreenText("CSV_UPLOADED_FILE_EXCEEDED_TEXT3")}}</p>
              </div>
            </div>
            <span v-if="((!isCsvFileUploaded) && (!maxFileSizeFlag) && (!isFileSelected)) ">
              <em class="check-icon">
                <img bx-attr="upload-icon" src="../../../assets/images/scholars/roaster/upload_icon.svg" alt />
              </em>

              <span bx-attr="csv-upload-drag-drop" class="upload-title-drag-drop">{{getScreenText("CSV_UPLOADED_DRAG_DROP")}}</span>
              <span>{{getScreenText("OR")}}</span>
              <span>
                <a bx-attr="roaster-upload-file" href="javascript:void(0)">{{getScreenText("CSV_UPLOADED_SELECT_FILE")}}</a>
              </span>
            </span>
            <span
              v-if="((maxFileSizeFlag) && (!isCsvFileUploaded) && (isFileSelected) && (!isFileCorrect))"
            >
              <span bx-attr="try-again-msg"  class="upload-title">{{getScreenText("CSV_UPLOADED_NEED_TRY")}}</span>
              <span>{{getScreenText("OR")}}</span>
              <span>
                <a bx-attr="upload-select-file" href="javascript:void(0)">{{getScreenText("CSV_UPLOADED_SELECT_FILE")}}</a>
              </span>
            </span>
            <span v-if="(isCsvFileUploaded && maxFileSizeFlag && (!isFileSelected))">
              <span bx-attr="upload-title" class="upload-title">{{getScreenText("CSV_UPLOADED_NEED_TRY")}}</span>
              <span>{{getScreenText("OR")}}</span>
              <span>
                <a bx-attr="roaster-upload" href="javascript:void(0)">{{getScreenText("CSV_UPLOADED_SELECT_FILE")}}</a>
              </span>
            </span>
            <span v-if="((!maxFileSizeFlag) && (!isCsvFileUploaded) && (isFileSelected))">
              <span bx-attr="upload-new-file">{{getScreenText("CSV_UPLOADED_NEW_FILE")}}</span>
              <span>{{getScreenText("OR")}}</span>
              <span>
                <a bx-attr="uploaded-csv" href="javascript:void(0)">{{getScreenText("CSV_UPLOADED_SELECT_FILE")}}</a>
              </span>
            </span>
          </div>
        </vue-dropzone>
      </div>
    </div>
    <button
      type="button"
      :class="[currentCsvFileName === '' && 'disable']"
      @click="uploadCSV" bx-attr="uploaded-continue-button"
      class="btn-primary"
    >{{getScreenText("CAPS_CONTINUE")}}</button>
  </div>
  </div>
</template>

<script lang="ts">
import UploadFileComponent from "@/components/scholarmanagement/uploadfile/UploadFileComponent";
export default UploadFileComponent;
</script>
<style lang="less" src="./UploadFileComponent.less"></style>










