<template>
  <div>
    <div class="center-align">
      <div style="display: none;" id="toastMsg" class="showToastMessage">
        {{getScreenText("DELETED_SCHOLAR_DATA_MSG")}}
      </div>
      <label v-if="!component" class="heading-middle">
        <bouncing-preloader :viewClass='{"margin-top":"40px", "margin-bottom":"10px"}'></bouncing-preloader>
      </label>
      </div>
      <div class="scholar-content">
        <div class="content-container">
          <div class="scholar-content-inner">
             <div  v-if="component !== 'step5'"  class="scholar-content-top clearfix">                        
                        <div v-if="component === 'upload-file'" class="scholar-content-top-left">
                              <h2 bx-attr="upload-csv-label">{{getScreenText("UPLOAD_CSV")}}</h2>
                              <h6 bx-attr="direction-label">{{getScreenText("DIRECTIONS")}}</h6>
                              <ul>
                                  <li class="clearfix">
                                      <div bx-attr="csv1" class="number">1</div>
                                      <div class="textDetails">
                                        <h6 bx-attr="prepare-file-label">{{getScreenText("PREPARE_FILE")}}</h6>
                                        <p bx-attr="csv-description">{{getScreenText("CSV_DESC_1")}}<strong>{{getScreenText("CSV_EXTN")}}</strong>{{getScreenText("CSV_DESC_2")}}</p>
                                        <a bx-attr="download-roaster" class="download-link" href="csv/roaster/Scholar_Roster_Template.csv" download>{{getScreenText("DOWNLOAD_TEMPLATE")}}</a>
                                      </div>
                                  </li>
                                  <li class="clearfix">
                                      <div bx-attr="csv2" class="number">2</div>
                                      <div class="textDetails">
                                        <h6 bx-attr="upload-file-label">{{getScreenText("UPLOAD_FILE")}}</h6>
                                        <p bx-attr="upload-desc" class="mb-20">{{getScreenText("ULOAD_DESC_1")}}<strong>{{getScreenText("CSV_EXTN")}}</strong>{{getScreenText("ULOAD_DESC_2")}}<strong>{{getScreenText("500_MB")}}</strong>{{getScreenText("ULOAD_DESC_3")}}<a bx-attr="navigateLMSUrl" @click="navigateLMSUrl" class="green-link">{{getScreenText("ULOAD_DESC_4")}}</a>{{getScreenText("ULOAD_DESC_5")}}<strong>{{getScreenText("XLS_EXTN")}}</strong>{{getScreenText("TO")}}<strong>{{getScreenText("CSV_EXTN")}}</strong>.</p>
                                        <p bx-attr="upload-para" >{{getScreenText("UPLOAD_PERA_START")}}<strong>{{getScreenText("CSV_EXTN")}}</strong>{{getScreenText("UPLOAD_PERA_END")}}</p>
                                      </div>
                                  </li>
                              </ul>
                        </div>


                        <div v-if="component === 'match-columns'" class="scholar-content-top-left">
                              <h2 bx-attr="match-columns-step2" >{{getScreenText("LABEL_STEP_2_MATCH_COL")}}</h2>
                              <h6 bx-attr="match-columns-direction">{{getScreenText("LABEL_STEP_2_DIRECTIONS")}} </h6>
                              <p bx-attr="match-columns-direction1">{{getScreenText("LABEL_STEP_2_DESCRIPTION_PREFIX")}}<span class="fs-16 color-red">{{getScreenText("ASTERRISK")}}</span>{{getScreenText("LABEL_STEP_2_DESCRIPTION_SUFFIX")}}</p>
                        </div>

                        <div v-if="component === 'repair-table' || component === 'error_screen'" class="scholar-content-top-left">
                              <div v-if="component === 'repair-table'">
                                <h2 bx-attr="repair-table-step3">{{getScreenText("STEP_3_REPAIR")}}</h2>
                                <h6 bx-attr="repair-table-direction">{{getScreenText("LABEL_STEP_2_DIRECTIONS")}}</h6>
                                <p bx-attr="repair-table-direction1">{{getScreenText("STEP_3_REPAIR_DESCRIPTION")}}</p>
                              </div>

                                <div v-if="component === 'error_screen'">
                                <h2 bx-attr="error_screen-table-step1">{{getScreenText("ERROR_STEP_4_AN_ISSUE")}}</h2>
                                <h6 bx-attr="error_screen-table-direction">{{getScreenText("LABEL_STEP_2_DIRECTIONS")}}</h6>
                                <p bx-attr="error_screen-table-direction1" class="pb-22">{{getScreenText("ERROR_STEP_4_DIRECTIONS")}}</p>
                                <p bx-attr="error_screen-table-direction-points" v-for="(direction, index) in errorScreenDirections" :key="index">
                                  {{index + 1}}. {{direction}}
                                </p>
                              </div>
                        </div>

                        <div v-if="component && component !=='step5' && component !=='error_screen'" class="scholar-content-top-right clearfix">
                  
                                <div v-for="(step, index) in stepper" :key="index" class="step">
                                  <div :bx-attr="`roaster-steps${index + 1}`" @click="disableStepper(step)" :class="[step.class]">
                                    <em>{{index + 1}}</em><span>{{step.title}}</span>
                                  </div>
                                </div>
                        </div>

                 </div>
                   
                <div v-if="component != 'match-columns' && !isMobileView" class="scholar-section-bottom text-right">
                      <figure>
                            <img src="../../assets/images/scholars/add-new-scholars/scholars.svg" alt=""/>
                      </figure>
                </div>  
          </div>
      </div>    
      <component :signalRStrip="signalRStrip" :is="component" @signalRStrip="signalR" :userDetails="userDetails" @next="shiftScreen" :componentName="component" :stepId="stepId" :roleId="roleId" @navigateStepper="disableStepper" :isSignalRProcessing="isSignalRProcessing" @showDeleteToastMsg="showDeleteToastMsg" :key="rerender"/>
    </div>
  </div>
</template>

<script lang="ts">
import ScholarManagementComponent from "@/components/scholarmanagement/ScholarManagementComponent";
export default ScholarManagementComponent;
</script>
<style lang="less" scoped src="./ScholarManagementComponent.less"></style>



