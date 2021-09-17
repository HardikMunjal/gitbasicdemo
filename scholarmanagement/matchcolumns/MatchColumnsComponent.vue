<template>

              <div class="scholar-content-bottom">
                    <div class="content-container z-index-class">
                         <div class="clearfix unreolved-continue-wrapper">
                              <div id="wrap" class="unresolved-wrapper" :class="[stickyWrapperBtn && 'active']">
                                   <button>{{getScreenText("LBL_UNRESOLVED")}} <span>{{this.currentUnresolved}}/{{(unresolvedRowIndexes && unresolvedRowIndexes.length) ? unresolvedRowIndexes.length: 0 }}</span></button>
                                   <em class="arrow arrow-left" bx-attr="unresolved-button-pre" @click="prevLabel"><img src="../../../assets/images/scholars/add-new-scholars/arrowLeft.svg" alt=""></em>
                                   <em class="arrow arrow-right" bx-attr="unresolved-button-next" @click="nextLabel"><img src="../../../assets/images/scholars/add-new-scholars/arrowRight.svg" alt=""></em>
                              </div>
                              <button type="button" :class="['btn-primary float-right', !validity && 'disable', disableContinueButton && 'disable']" bx-attr="match-column-button" @click="goToRepairProb" :disabled="disableContinueButton">{{getScreenText("CAPS_CONTINUE")}}</button>
                          </div>

                          <div  class="scholar-content-inner-content">
                               <div class="scholar-content-info">
                                    
                                     <div class="clearfix scholar-content-info-top" v-if="dataFetched">
                                          <label class="heading-left">{{getScreenText("BELLXCEL_COL_LABEL")}}</label>
                                          <label class="heading-right">{{getScreenText("CSV_COL_LABEL")}}</label>
                                     </div>
                                     <div v-if="!dataFetched">
                                          <bouncing-preloader :viewClass='{"margin-top":"20px", "margin-bottom":"10px"}'> </bouncing-preloader>
                                     </div>
                                     <div  class="scholar-content-list clearfix" v-if="groupWiseHeaders||false">
                                           <div class="scholar-content-list-cell" v-for="(bxLabels, groupKey) in groupWiseHeaders" :key="groupKey" @click="$event.stopPropagation(),selectedBxGroup = groupKey" :class="[selectedBxGroup === groupKey && 'active']">
                                                <h5>{{groupKey}}</h5>
                                                <ul v-if="bxLabels && bxLabels.length">
                                                     <li v-for="(label, key) in bxLabels" :key="key" :id='groupKey+"_"+label.rowIndex' @click.capture="selectedCsvLabel = key" :class="[selectedCsvLabel === key && 'active']"> 
                                                          <drop-down v-if="label" id="component-dropdown" 
                                                          :groupKey="groupKey"
                                                          :label="{rowIndex: label.rowIndex, 
                                                                   columnName: label.columnName, 
                                                                   isHeaderMandatory: label.isHeaderMandatory, 
                                                                   isCustom: label.isCustom, 
                                                                   selectedOption: label.selectedOption,
                                                                   columnSynonyms:label.columnSynonyms,
                                                                   key: key,
                                                                   selectedLabel: selectedCsvLabel }" 
                                                                      @updateUnresolved="updateUnresolvedCount"
                                                                   :options="label.matchedArray" ></drop-down>
                                                     </li>
                                                </ul>
                                           </div>
                                     </div>
                                     <div  class="scholar-content-list clearfix components_container" >
                                          
                                           <div :class="['scholar-content-list-cell uk-animation-fade' ,data[0]&&data[0].groupName&&(data[0].groupName.split(' ').join('')) ]" v-for="(data,index) in mappedData" :key="data[0].rowIndex"  :id="'row-'+data[0].rowIndex">
                                                     <div class="active" :id="data[0]&&data[0].rowIndex">
                                                           
                                                          <drop-down id="component-dropdown" 
                                                          v-if="data[0]&&typeof(data[0])=='object'"
                                                          :mappedData="mappedData"
                                                          :label="{rowIndex: data[0].rowIndex, 
                                                                   columnName: data[0].columnName, 
                                                                   isHeaderMandatory: mandatoryHeaders, 
                                                                   isCustom: data[0].isCustom, 
                                                                   csvObject:data[1],
                                                                   selectedOption: data[1].columnName,
                                                                   columnSynonyms:data[0].columnSynonyms,
                                                                   key: index, 
                                                                   selectedLabel: data[0].columnName }" 
                                                                   :options="unmappedCsvHeaders"
                                                                 @updateUnresolved="updateUnresolvedCount"
                                                                   @fillUnMappedList="fillUnMappedList" bx-attr="column-dropdown"></drop-down>
                                                     </div>
                                           </div>
                                     </div>



                                     <div class="custom-column" >
                                             <a href="javascript:void(0)" :class="['enable-link']"  bx-attr="addCustomColumns" @click="addCustomColumns" class="add-custom-col">
                                                  {{getScreenText("ADD_CUSTOM_COL")}}
                                             </a>
                                              <small v-if="maxCustReached" >
                                                       <img @mouseenter="openTooltip" @mouseleave="closeTooltip" src="../../../assets/images/scholars/add-new-scholars/i.svg" alt="">
                                             </small>
                                             <div id="tooltip" class="uk-tooltip uk-display-inline-block uk-margin-remove uk-position-absolute">
                                                       {{getScreenText("6_COL_ADDED")}}
                                             </div>
                                             <div class="custom-column-btn-wrapper">
                                                  <button type="button" bx-attr="back-button" @click="backToUpload"  class="btn-secondary">{{getScreenText("CAPS_BACK")}}</button>
                                                  <button type="button" bx-attr="continue-button" @click="goToRepairProb" :class="['btn-primary continuebtn',!validity&&'disable-step3', disableContinueButton && 'disable']" :disabled="disableContinueButton">{{getScreenText("CAPS_CONTINUE")}}</button>
                                             </div>
                                     </div>
                                     <div  class="scholar-section-bottom text-right">
                                        <figure>
                                             <img src="../../../assets/images/scholars/add-new-scholars/scholars.svg" alt=""/>
                                        </figure>
                                     </div> 
                               </div>
                          </div>
                    </div>
                   <unresolved-popup v-if="openPopup" :continue_or_proceed='validity' @close='close' @next='moveNext'></unresolved-popup>
                   <upload-progress v-if="progressOpen" @close='close' ></upload-progress>
               </div>
         
</template>

<script lang="ts">
import MatchColumnsComponent from "@/components/scholarmanagement/matchcolumns/MatchColumnsComponent";
export default MatchColumnsComponent;
</script>
<style lang="less" src="./MatchColumnsComponent.less"></style>



