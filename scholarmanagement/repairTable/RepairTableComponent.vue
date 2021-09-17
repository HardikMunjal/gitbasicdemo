<template>
<div :class="['table-wrapper-parent', componentName == 'step5' && 'space-wrapper-parent']">  
  <add-scholar ref="addscholar" @createUserForm="openAddPanel" @openDuplicateFilePopUp="openFilePopup"  :rowItemsRoaster="rowItemsRoaster" :createFormStatus="openCreatePanel"  :rowToEdit="editableRow" :family="familyArray" :emergency="emergencyArray" :rowIds="rowIds" :panelTitle="panelTitle" @oldStatus="updateOldStatus" @addedScholar="getDataForPage" @updateRow="updateScholarData" @rowIdUpdater="rowIdUpdater" :parametersStore="step5ParametersStore" @sortOnSubmit="sortOnEdit" />
  <add-scholar-popup @close='closeScholarPopup' :isMobile="mobileView" :scholarName="scholarName" @openRoasterPanel="openAddPanel(true)"></add-scholar-popup>
  <duplicate-file-popup v-if="!mobileView" @close="closeFilePopup" @replaceFile="fileReplace" @keepBothFile="bothFile"></duplicate-file-popup>
   <deleteRosterConfirmation @close="closeDeleteRosterPopup" @deleteRoster="deleteRosterData" @keepBothFile="bothFile"></deleteRosterConfirmation>
  
  <div  class="content-container">
<div v-if="componentName==='step5'" class="clearfix table-details-wrapper table-details top-complete-container"  v-click-outside="()=>{toggleDropDown =false}">
           <div v-if="componentName==='step5'" class="top-row-container cal-width">
                
  <div v-if="roleId!=7 && !mobileView" style="display:inline" class="backcontbuttonwrapper">
    <div :class="[ 'wrap-drop',no_data_roaster=='enable'&& !onLoadData?'':'marginValue',toggleDropDown?'float-left mr-16 borderDropTop active':'float-left mr-16 borderDrop', isSignalRProcessing?'grey':'']" bx-attr="roaster-toggleDrop" @click="toggleDrop">
      <span>{{selectedDropValue}} </span>
      <ul class="drop">
          <li v-for="keyValue in dropDwonMenu" :key="keyValue" @click="dropDownHandler(keyValue)" :class="checkScholerLength(keyValue)?'disabled':''" ><a :bx-attr="`roaster-${keyValue.toLowerCase().split(' ').join('-')}`">{{keyValue}}</a></li>
          
      </ul>
    </div>
  </div>
          
  <strong v-if="!mobileView">{{getScreenText("LBL_TOTAL_NUM_SCHOLAR")}} <span>{{this.activeCountScholars == 0 ? "--" : this.activeCountScholars}}</span></strong>
                      <div v-if="mobileView" class="Mobileheader">
                      <span v-if="no_data_roaster !='enable'&& onLoadData" bx-attr="roaster-openSearchPopup"  @click="$refs.filterPanels.show()"> 
                        <img src="../../../assets/images/common-icon/filterGreen.svg" alt="" /> 
                        <span class="filterText">{{getScreenText('FILTER')}}</span>
                      </span>
                      <strong v-if="mobileView ">{{getScreenText("LBL_TOTAL_NUM_SCHOLAR_MOBILE")}} <span>{{this.activeCountScholars == 0 ? "--" : this.activeCountScholars}}</span></strong>
                      </div>
                    </div>
                      <div class="table-details-right-top" v-if="!mobileView">
                        <a v-if="no_data_roaster!='enable' && onLoadData" href="javascript:void(0)" bx-attr="export-roaster" @click="download"><img src="../../../assets/images/scholars/add-new-scholars/download.svg" alt="" />{{getScreenText("BTN_EXPORT")}}</a>  
                      </div>
                    </div>
            <div v-if="componentName==='error_screen'" class="top-row-container">
                      <div v-if="!mobileView" class="table-details-right-top second-div">
                      <p class="mb18">
                        <a href="javascript:void(0)" bx-attr="download-roaster" @click="download"><img src="../../../assets/images/scholars/add-new-scholars/download.svg" alt="" />{{getScreenText("BTN_DOWNLOAD")}}</a>  
                      </p>
                      <p><strong>{{getScreenText("LBL_TOTAL_NUM_SCHOLAR")}} 
                        <span>{{this.activeCountScholars == 0 ? "--" : this.activeCountScholars}}</span></strong>
                      </p>
                      </div>
          </div>
    </div>

    <div class="step-3-wrapper repair">
        <div class="grey-header-background"   v-if="!mobileView && no_data_roaster !='enable'&& onLoadData"></div>
         <div class="content-container">
         <div v-if="((no_data_roaster !='enable'&& onLoadData) || (no_data_roaster !='enable' && componentName == 'step5' && step5DataAdded))" class="clearfix table-details-wrapper table-details">
           <div> 
              <div v-if="componentName !== 'step5'&&componentName !== 'error_screen'" :class="['unresolved-wrapper',fixUnresolved &&'unresolved-wrapper-fixed']">
                  <div class="unresolved-container">
                      <figure class="button-right">
                        <img v-if="(issuesContainer.findIndex((item) => item.currentActiveIndex === true)+1) !==0" src="../../../assets/images/scholars/add-new-scholars/buttonLeft.svg" alt="">
                      </figure>
                      <button class="unrebtn">{{getScreenText("UNRESOLVED")}} 
          
                        <span>{{componentName === 'repair-table'?(issuesContainer.findIndex((item) => item.currentActiveIndex === true)+1)+'/':''}}{{unresolvedStep3Validations.length==0?issuesContainer.length: unresolvedStep3Validations.length}}</span>
                      </button>
                     
                  </div>
                  
                       <div :class="['bottom-container',(issuesContainer.length<=1) &&'hide-bottom-container']">
                        <div class="skip-container" v-if="skipPopupDisplay === true">
                          {{getScreenText("PLEASE_FILL_THE_CELL")}}
                          <a bx-attr="openSkipPopup" @click="openSkipPopup(arrowIssueClicked)">{{getScreenText("STEP_3_SKIP")}}</a>
                        </div>
                        <div class="required-container" v-if="requiredPopupDisplay">
                          {{getScreenText("STEP_3_FILL_REQUIRED_FIELD")}}
                          <a bx-attr="requiredPopDisplay" @click="requiredPopDisplay(arrowIssueClicked)">{{getScreenText("STEP_3_OK")}}</a>
                        </div>
                  </div>
                 
              </div>
           </div>
            <div class="search-box" style="float: right;" v-if="!mobileView && componentName === 'step5' ">
              <span v-if="query.length==0" class='search-icon' bx-attr="search-button" @click="searchUsingQuery(query)">
                <img alt="search" src="../../../assets/images/common-icon/search.svg" />
              </span>
              <button v-else type="button" class="close-icon" bx-attr="search-closeQuery" @click="closeQuery">
                <img alt="close" src="../../../assets/images/common-icon/closeIconBlack.svg" width="21px" />
              </button>
              <input  placeholder="Search" bx-attr="search-input-box" v-model="query" @keyup.prevent="checkEnterSearch" @blur="checkForfocusOut"> 
            </div>
            <div class="table-details-left" v-if="!mobileView">
                <label bx-attr="display-label">Display:</label>
                <div class="form-dropdown width-fix" v-click-outside="()=>{openDropStatus =false}">
                     <div tabindex="0" class="form-dropdown-title" 
                      @keyup.enter="openDropdown()" 
                      @keydown.tab="openDropdown(true)"
                      @click="openDropdown()" bx-attr="displayName-dropdown">
                        <span>
                          <em>
                            <img src="../../../assets/images/scholars/add-new-scholars/arrowDown.svg" alt="" />
                          </em> 
                          <span class="slideLeft">{{defaultSelectionDrop}}</span>
                        </span>
                      </div>
                     <div class="dropdown-submenu" v-if="openDropStatus">
                        <ul class="dropdown-submenu-list">
                            <li v-for="(displayName,displayIndex) in displayColumnItems" :key="displayIndex" :bx-attr="`displayName-${displayName.toLowerCase().split(' ').join('-')}`" @click="changeDisplayView(displayName)" :title="displayName">
                              <a :style="[(componentName==='repair-table' || componentName==='error_screen') && displayName=='Scheduled Days'?{'display':'none'}:'']">
                                {{displayName}}
                              </a>
                            </li>
                        </ul>
                     </div>
                </div>
            </div>
           
            <div v-if="componentName=='error_screen'" style="margin-left:78px">
                <button :class="[scholarsSearchCount!==0?'btn-primary':'btn-primary disable', disableViewRoster && 'disable']" bx-attr="view-roster-page" :disabled="disableViewRoster" @click="moveToStep5()">View Roster</button>
            </div>
            <div class="table-details-right" :class="[componentName==='step5'?'margin-top-0':'']">
      
                <strong v-if="componentName === 'repair-table'">{{getScreenText("LBL_TOTAL_NUM_SCHOLAR")}} <span>{{this.activeCountScholars == 0 ? "--" : this.activeCountScholars}}</span></strong>
                
            </div>
      </div>
      <div v-if="rowItemsRoaster.length==0 && no_data_roaster!='enable' && !searchNoContentCase && !dataLoaded && componentName!=='step5'">
        <bouncing-preloader :viewClass='{"margin-top":"20px", "margin-bottom":"10px"}'> </bouncing-preloader>
      </div>

      <div v-if="rowItemsRoaster.length==0 && no_data_roaster!='enable' && !searchNoContentCase && !dataLoaded && componentName=='step5'">
        <bouncing-preloader> </bouncing-preloader>
      </div>






      <div class='repair-table-container'>  
        <template v-if="!mobileView" >

<div bx-attr="roster-table" class="fixed-table-wrapper" :class="[componentName !=='step5'?'edit-pointer':'']"  
  v-show="(componentName!=='step5' &&rowItemsRoaster && rowItemsRoaster.length>0 && !searchNoContentCase) || (componentName=='step5'&&no_data_roaster=='disable'&&rowItemsRoaster && rowItemsRoaster.length>0 && !searchNoContentCase)" >
	<div class="wrap">
    <div bx-attr="table-left-column"  class="freeze-left-column table-main">
     <div bx-attr="table-header-row" class="table-row header-tbl">
        <div bx-attr="table-cell" class="table-cell"> </div>
       <div  bx-attr="table-cell" class="table-cell" v-for="(column, index) in firstHeder" 
              v-show="(componentName=='repair-table'||(componentName=='step5'||componentName=='error_screen')&&column.columnTitle!='BellXcel Id' && column.columnTitle!='documents')"
              scope="col"
              :class="[(index===0||index===1)&&'first-head-cell','head-cell',dynamicScrollableClass && 'scroll-set',column.isHidden&&'hide-col-cell' ]"
              :key="index"> 
            <div class="sort-icon"  @click="toggleSort(column,index)">
            <span :bx-attr="`column-title-${column.columnTitle.toLowerCase().split(' ').join('-')}`" class='column-title'> {{column.columnTitle}} </span>                             
            <img class="" :bx-attr="`toggleSort-button-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-if="(( column.order === 1) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen') && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)) " alt="" src="../../../assets/images/icon-green/sort-up.svg">
            <img class="" :bx-attr="`toggleSort-button-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="((column.order === 2) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-down.svg">
            
            <img class="light-icon" :bx-attr="`toggleSort-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (( column.order === 0 && (componentName =='step5' || componentName =='repair-table'|| componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column))" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

            <img class="uk-margin-small-left" :bx-attr="`toggleSort-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (componentName=='error_screen' || componentName =='repair-table' || componentName=='error_screen')  && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

            <img class="issue-image ml5" v-if="issuesContainer.findIndex((item) => item.referenceCell.split(':')[1] === column.columnName) !== -1 && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency')" src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" alt="">
            </div>
          </div>
      </div>
        <div class="table-left-column-number">
        <div bx-attr="table-row" class="table-row" v-for="(rowItem, index) in firstBody" :key="index" v-show="(rowsToShow.length===0)|| (rowsToShow.findIndex((item) => item===index) !==-1)">
          <div bx-attr="table-cell" class="table-cell">
            {{calculateIndex(index)}} 
            <img bx-attr="openEditPanel-button" class="hover-class" @click="openEditPanel(true,rowItem,index)"  v-if="componentName==='step5'" src="../../../assets/images/scholars/add-new-scholars/pencil-edit.svg" alt="" />
          </div>
          <div bx-attr="table-cell" class="table-cell"
            v-for="(rowItemColumn, indexRowColumn) in rowItem" 
            :class="[dynamicScrollableClass && 'scroll-set',
                      rowItemColumn.isHidden&&'hide-row-cell',
                      (rowItemColumn.issueType==='emptyField'||rowItemColumn.issueType==='phoneNumberInvalid' ||rowItemColumn.issueType==='emailInvalid')&&(componentName === 'repair-table'||componentName === 'error_screen')&&'highlight-cell',
                      (rowsToShow.findIndex((item) => item===index) !==-1)&&(indexRowColumn==='lastName'||indexRowColumn==='firstName')&&'highlight-name']"
            @click="(componentName === 'repair-table')&&checkCellPos(index,indexRowColumn)" 
            @dblclick="(componentName === 'repair-table')&&makeCellEditable(index,indexRowColumn,rowItemColumn)" 
            :id="index+':'+indexRowColumn"
            :key="indexRowColumn">
              <div    
                class="alert-risk"                                     
                :ref="index+':'+indexRowColumn"
                :id="index+':'+indexRowColumn"
                >
                              
                <figure>
                  <img 
                  class="issue-image"
                  v-if="rowCheckEmpty.findIndex((item) => item.emptyCount ==52 && item.rowIndex ===index)!==-1 && indexRowColumn==='lastName'" 
                  src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" 
                  alt="">
              </figure>
              <div class="sd-container"   v-if="(checkRow(indexRowColumn)&&currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1]!=='classroom' &&!currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))"  >
                  <input 
                  :id="indexRowColumn"
                  :class="'date-cell'" 
                  type="date"
                :format="'MM/DD/YYYY'"
                :max="today"
                :defaultValue="dateValue"
                  v-model="dateValue"
                  required="false"
                @keyUp="changeDate(rowItemColumn.value)"
                @blur="updateDateIssuesBlur(dateValue!=''?dateValue:rowItemColumn.value)"
                min="0"
                oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input-date"/>

              <span v-if="!isChrome" class="open-button">
                <img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVRYhe3VOwoCQRBF0aOBG1Fch7mBgh8wEBPNBAXNNPGzATNXoNs0cIJxhAGnRZO68IKiq5oL3VAEQRB8RhvbkvNN1vM1ahhhmGWKc64u5ohZrh6hniLQwwndLONCXcwBk1x9Qj9VIH9BE8uS/iVaJfPJAr+eN8cenYrZYZEisMLF82NVyQXrFIG/P0EIhEAI9DyXSqNiBqkCTdxxrZib190QBEHwxgMNkzFvJ1SBSgAAAABJRU5ErkJggg=="/>
            
                </span>
              </div>
              <input 
                  :id="indexRowColumn"
                :class="[dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date-cell':'input-cell']" 
                :type="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date':phoneNumberFields.indexOf(currentDblClickedCell.split(':')[1])!==-1 ? 'text':'text'"
                :format="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1&&'MM/DD/YYYY'"
                :max="today"
                :defaultValue="rowItemColumn.value"
                  v-model="rowItemColumn.value"
                v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index)  &&!currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))" 
                
                @keyUp="changeDate(rowItemColumn.value)"
                @blur="updateIssuesBlur(rowItemColumn.value)"
                min="0"
                oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input"/>
                
                        
                <div 
                    class="classroom-list"  
                    @blur="updateIssuesBlur(rowItemColumn.value)"
                    v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1].includes('custom')&&(currentDblClickedCell.split(':')[1]==indexRowColumn))">
                      <select style="width: 100%;" v-model="rowItemColumn.value"  @onChange="updateIssuesBlur(rowItemColumn.value)" bx-attr="customOptions">
                        <option 
                            v-for="(customValue,customValueIndex) in customOptions"
                            :key="customValueIndex" >{{customValue}}</option>
                      </select>
                </div>
                <a  
                class="cell-ellipsis ellipsis"
                @click="callHover(index+':'+indexRowColumn,$event)"
                @mouseover="callHover(index+':'+indexRowColumn,$event)" 
                @mouseout="callHoverOut()"
                v-else bx-attr="cell-ellipsis">                  
                {{rowItemColumn.value}}
                </a>
                </div>
          </div>
        </div>

        <div class="left-column-scroll-placeholder"></div>
                </div>

    </div>
    <div class="headers">
      <scroll-sync proportional horizontal class="scroller syncscroll" name="myElements">
        <div class="table-main">

          <div bx-attr="table-row" class="table-row header-tbl">
            <div bx-attr="table-cell" class="table-cell" v-for="(column, index) in secondHeader" 
              v-show="(componentName=='repair-table'||(componentName=='step5'||componentName=='error_screen')&&column.columnTitle!='BellXcel Id' && column.columnTitle!='documents')"
              scope="col"
              :class="[(index===0||index===1)&&'first-head-cell','head-cell',dynamicScrollableClass && 'scroll-set',column.isHidden&&'hide-col-cell' ]"
              :key="index"> 
            <div class="sort-icon"  @click="toggleSort(column,index)">
            <span :bx-attr="`column-title-${column.columnTitle.toLowerCase().split(' ').join('-')}`" class='column-title'> {{column.columnTitle}} </span>                             
            <img class="" :bx-attr="`toggleSort-button-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-if="(( column.order === 1) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen') && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)) " alt="" src="../../../assets/images/icon-green/sort-up.svg">
            <img class="" :bx-attr="`toggleSort-button-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="((column.order === 2) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-down.svg">
            
            <img class="light-icon" :bx-attr="`toggleSort-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (( column.order === 0 && (componentName =='step5' || componentName =='repair-table'|| componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column))" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

            <img class="uk-margin-small-left" :bx-attr="`toggleSort-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (componentName=='error_screen' || componentName =='repair-table' || componentName=='error_screen')  && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

            <img class="issue-image ml5" v-if="issuesContainer.findIndex((item) => item.referenceCell.split(':')[1] === column.columnName) !== -1 && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency')" src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" alt="">
            </div>
            </div>
          </div>

        </div>


      </scroll-sync>
    </div>
    <scroll-sync proportional horizontal class="tracks syncscroll" name="myElements" id="currentTable">
      <scroll-sync proportional horizontal class="tracks syncscroll scroll-fixed-bottom scrolling-div-show" name="myElements" id="layerWhenScrolling">
      <div>
        <div id="table-scroll-wrapper" style="height:10px;"></div>
      </div>
      </scroll-sync>
      <div class="table-main">
        <div bx-attr="table-row" id="table-row" class="table-row" v-for="(rowItem, index) in secondBody" :key="index" v-show="(rowsToShow.length===0)|| (rowsToShow.findIndex((item) => item===index) !==-1)">
            <div bx-attr="table-cell" class="table-cell"
              v-for="(rowItemColumn, indexRowColumn) in rowItem" 
              :class="[dynamicScrollableClass && 'scroll-set',
                        rowItemColumn.isHidden&&'hide-row-cell',
                        (rowItemColumn.issueType==='emptyField'||rowItemColumn.issueType==='phoneNumberInvalid' ||rowItemColumn.issueType==='emailInvalid')&&(componentName === 'repair-table'||componentName === 'error_screen')&&'highlight-cell',
                        (rowsToShow.findIndex((item) => item===index) !==-1)&&(indexRowColumn==='lastName'||indexRowColumn==='firstName')&&'highlight-name']"
              @click="(componentName === 'repair-table')&&checkCellPos(index,indexRowColumn)" 
              @dblclick="(componentName === 'repair-table')&&makeCellEditable(index,indexRowColumn,rowItemColumn)" 
              :id="index+':'+indexRowColumn"
              :key="indexRowColumn">
                <div    
                  class="alert-risk"                                     
                  :ref="index+':'+indexRowColumn"
                  :id="index+':'+indexRowColumn"
                  >
                               
                  <figure>
                    <img 
                    class="issue-image"
                    v-if="rowCheckEmpty.findIndex((item) => item.emptyCount ==52 && item.rowIndex ===index)!==-1 && indexRowColumn==='lastName'" 
                    src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" 
                    alt="">
                </figure>
                <div class="sd-container"   v-if="(checkRow(indexRowColumn)&&currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1]!=='classroom' &&!currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))"  >
                    <input 
                    :id="indexRowColumn"
                    :class="'date-cell'" 
                    type="date"
                  :format="'MM/DD/YYYY'"
                  :max="today"
                  :defaultValue="dateValue"
                    v-model="dateValue"
                    required="false"
                  @keyUp="changeDate(rowItemColumn.value)"
                  @blur="updateDateIssuesBlur(dateValue!=''?dateValue:rowItemColumn.value)"
                  min="0"
                  oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input-date"/>

                <span v-if="!isChrome" class="open-button">
                  <img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVRYhe3VOwoCQRBF0aOBG1Fch7mBgh8wEBPNBAXNNPGzATNXoNs0cIJxhAGnRZO68IKiq5oL3VAEQRB8RhvbkvNN1vM1ahhhmGWKc64u5ohZrh6hniLQwwndLONCXcwBk1x9Qj9VIH9BE8uS/iVaJfPJAr+eN8cenYrZYZEisMLF82NVyQXrFIG/P0EIhEAI9DyXSqNiBqkCTdxxrZib190QBEHwxgMNkzFvJ1SBSgAAAABJRU5ErkJggg=="/>
              
                  </span>
                </div>
                <input 
                    :id="indexRowColumn"
                  :class="[dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date-cell':'input-cell']" 
                  :type="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date':phoneNumberFields.indexOf(currentDblClickedCell.split(':')[1])!==-1 ? 'text':'text'"
                  :format="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1&&'MM/DD/YYYY'"
                  :max="today"
                  :defaultValue="rowItemColumn.value"
                    v-model="rowItemColumn.value"
                  v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && !currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))" 
                  
                  @keyUp="changeDate(rowItemColumn.value)"
                  @blur="updateIssuesBlur(rowItemColumn.value)"
                  min="0"
                  oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input"/>
                 
                          
                  <div 
                      class="classroom-list"  
                      @blur="updateIssuesBlur(rowItemColumn.value)"
                      v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1].includes('custom')&&(currentDblClickedCell.split(':')[1]==indexRowColumn))">
                        <select style="width: 100%;" v-model="rowItemColumn.value"  @onChange="updateIssuesBlur(rowItemColumn.value)" bx-attr="customOptions">
                          <option 
                              v-for="(customValue,customValueIndex) in customOptions"
                              :key="customValueIndex" >{{customValue}}</option>
                        </select>
                  </div>
                                    
                                 <a  
                                 class="cell-ellipsis ellipsis"
                                 @click="callHover(index+':'+indexRowColumn,$event)"
                                 @mouseover="callHover(index+':'+indexRowColumn,$event)" 
                                 @mouseout="callHoverOut()"
                                 v-else bx-attr="cell-ellipsis">
                                 
                                 {{rowItemColumn.value}}
                                 </a>
                                 </div>
            </div>

          </div>
        <span id="endSpan"></span>
      </div>

                 <span v-if="hovering!=='' && hovering==currentHoveredCell" :style="hoverStyleObj" class="tooltip-new tooltip">
                    {{hoveredCellValue}}
                </span>



    </scroll-sync>

   <scroll-sync proportional horizontal class="tracks syncscroll scroll-fixed-bottom" id="scrollBottom" name="myElements">

      <div id="table-scroll" style="width:1556px;height:10px;">

      </div>
   </scroll-sync>
  </div>
</div>
        </template>  
              <template v-if="mobileView">
               <div v-if="(componentName!=='step5' &&rowItemsRoaster && rowItemsRoaster.length>0 && !searchNoContentCase) || (componentName=='step5'&&no_data_roaster=='disable'&&rowItemsRoaster && rowItemsRoaster.length>0 && !searchNoContentCase)" class="repair-table subreddit-table-wrapper bg-gray" @scroll="scroll($event,'table')" ref="repairTable">                   
                 <table aria-describedby="reapir table" class='table'  v-click-outside="removeDblClickedCell">
                      <thead>
                        <tr :class="[componentName == 'repair-table' && 'table-flex']">
                          <th  scope="col" :class="['first-head-cell']"></th>
                          <th 
                            v-for="(column, index) in columnsRoaster" 
                            v-show="(componentName=='repair-table'||(componentName=='step5'||componentName=='error_screen')&&column.columnTitle!='BellXcel Id' && column.columnTitle!='documents')"
                            scope="col"
                            :class="[(index===0||index===1)&&'first-head-cell','head-cell',dynamicScrollableClass && 'scroll-set',column.isHidden&&'hide-col-cell' ]"
                            :key="index"> 
                              <div class="display-flex sort-icon"  @click="toggleSort(column,index)">
                              <span :bx-attr="`column-title-${column.columnTitle.toLowerCase().split(' ').join('-')}`" class='column-title'> {{column.columnTitle}} </span>                             
                              <img class="" :bx-attr="`toggleSort-button-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-if="(( column.order === 1) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen') && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)) " alt="" src="../../../assets/images/icon-green/sort-up.svg">
                              <img class="" :bx-attr="`toggleSort-button-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="((column.order === 2) && (componentName =='step5' || componentName =='repair-table' || componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-down.svg">
                              
                              <img class="light-icon" :bx-attr="`toggleSort-up-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (( column.order === 0 && (componentName =='step5' || componentName =='repair-table'|| componentName=='error_screen')) && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column))" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

                              <img class="uk-margin-small-left" :bx-attr="`toggleSort-down-${column.columnTitle.toLowerCase().split(' ').join('-')}`" v-else-if="(sortArrayIndexes.indexOf(index) !== -1)|| (componentName=='error_screen' || componentName =='repair-table' || componentName=='error_screen')  && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency') && hideSortingOnCustomColumn(componentName,column)" alt="" src="../../../assets/images/icon-green/sort-up-down.svg">

                              <img class="issue-image ml5" v-if="issuesContainer.findIndex((item) => item.referenceCell.split(':')[1] === column.columnName) !== -1 && !column.columnType.includes('Family')&& !column.columnType.includes('Emergency')" src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" alt="">
                              </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                          <tr v-for="(rowItem, index) in rowItemsRoaster" :key="index" v-show="(rowsToShow.length===0)|| (rowsToShow.findIndex((item) => item===index) !==-1)">
                              <td>
                                {{calculateIndex(index)}} 
                                <img bx-attr="openEditPanel-button" @click="openEditPanel(true,rowItem,index)" style="margin-top: -6px;" v-if="componentName==='step5'" src="../../../assets/images/scholars/add-new-scholars/pencil-edit.svg" alt="" />
                              </td>
                             
                              <td 
                                v-for="(rowItemColumn, indexRowColumn) in rowItem" 
                                :class="[dynamicScrollableClass && 'scroll-set',
                                          rowItemColumn.isHidden&&'hide-row-cell',
                                          (rowItemColumn.issueType==='emptyField'||rowItemColumn.issueType==='phoneNumberInvalid' ||rowItemColumn.issueType==='emailInvalid')&&(componentName === 'repair-table'||componentName === 'error_screen')&&'highlight-cell',
                                          (rowsToShow.findIndex((item) => item===index) !==-1)&&(indexRowColumn==='lastName'||indexRowColumn==='firstName')&&'highlight-name']"
                                @click="(componentName === 'repair-table')&&checkCellPos(index,indexRowColumn)" 
                                @dblclick="(componentName === 'repair-table')&&makeCellEditable(index,indexRowColumn,rowItemColumn)" 
                                :id="index+':'+indexRowColumn"
                                :key="indexRowColumn">
                                <div    
                                class="alert-risk"                                     
                                :ref="index+':'+indexRowColumn"
                                :id="index+':'+indexRowColumn"
                                >
                               
                                   <figure>
                                      <img 
                                      class="issue-image"
                                      v-if="rowCheckEmpty.findIndex((item) => item.emptyCount ==52 && item.rowIndex ===index)!==-1 && indexRowColumn==='lastName'" 
                                      src="../../../assets/images/scholars/add-new-scholars/overdue-filter.svg" 
                                      alt="">
                                  </figure>
                                  <div class="sd-container"   v-if="(checkRow(indexRowColumn)&&currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1]!=='classroom' &&!currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))"  >
                                     <input 
                                     :id="indexRowColumn"
                                     :class="'date-cell'" 
                                      type="date"
                                    :format="'MM/DD/YYYY'"
                                    :max="today"
                                    :defaultValue="dateValue"
                                     v-model="dateValue"
                                      required="false"
                                    @keyUp="changeDate(rowItemColumn.value)"
                                    @blur="updateDateIssuesBlur(dateValue!=''?dateValue:rowItemColumn.value)"
                                    min="0"
                                    oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input-date"/>
              
                                 <span v-if="!isChrome" class="open-button">
                                   <img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVRYhe3VOwoCQRBF0aOBG1Fch7mBgh8wEBPNBAXNNPGzATNXoNs0cIJxhAGnRZO68IKiq5oL3VAEQRB8RhvbkvNN1vM1ahhhmGWKc64u5ohZrh6hniLQwwndLONCXcwBk1x9Qj9VIH9BE8uS/iVaJfPJAr+eN8cenYrZYZEisMLF82NVyQXrFIG/P0EIhEAI9DyXSqNiBqkCTdxxrZib190QBEHwxgMNkzFvJ1SBSgAAAABJRU5ErkJggg=="/>
                                
                                   </span>
                                  </div>
                                 <input 
                                     :id="indexRowColumn"
                                    :class="[dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date-cell':'input-cell']" 
                                    :type="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1?'date':phoneNumberFields.indexOf(currentDblClickedCell.split(':')[1])!==-1 ? 'text':'text'"
                                    :format="dateFields.indexOf(currentDblClickedCell.split(':')[1])!==-1&&'MM/DD/YYYY'"
                                    :max="today"
                                    :defaultValue="rowItemColumn.value"
                                     v-model="rowItemColumn.value"
                                    v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index)  &&!currentDblClickedCell.split(':')[1].includes('custom') &&(currentDblClickedCell.split(':')[1]==indexRowColumn))" 
                                   
                                    @keyUp="changeDate(rowItemColumn.value)"
                                    @blur="updateIssuesBlur(rowItemColumn.value)"
                                    min="0"
                                    oninput="validity.valid||(value='');" bx-attr="rowItemColumn-input"/>
                                   
                          
                                    <div 
                                        class="classroom-list"  
                                        @blur="updateIssuesBlur(rowItemColumn.value)"
                                        v-else-if="(currentDblClickedCell.length>3&&(currentDblClickedCell.split(':')[0]==index) && currentDblClickedCell.split(':')[1].includes('custom')&&(currentDblClickedCell.split(':')[1]==indexRowColumn))">
                                          <select style="width: 100%;" v-model="rowItemColumn.value"  @onChange="updateIssuesBlur(rowItemColumn.value)" bx-attr="customOptions">
                                            <option 
                                               v-for="(customValue,customValueIndex) in customOptions"
                                               :key="customValueIndex" >{{customValue}}</option>
                                          </select>
                                    </div>
                                    
                                 <a  
                                 class="cell-ellipsis ellipsis"
                                 @click="callHover(index+':'+indexRowColumn,$event)"
                                 @mouseover="callHover(index+':'+indexRowColumn,$event)" 
                                 @mouseout="callHoverOut()"
                                 v-else bx-attr="cell-ellipsis">
                                 {{rowItemColumn.value}}
                                 </a>
                                 </div>
                                </td>
                          </tr>
                      </tbody>
                 </table>
                 <span v-if="hovering!=='' && hovering==currentHoveredCell" :style="hoverStyleObj" :class="['tooltip-new','tooltip', isMobile? 'mobile-tooltip-width' : '']">
                    {{hoveredCellValue}}
                </span>
              </div>
              </template>
          <div v-if="searchNoContentCase" class="relative">
            <figure class="no-search-image"><img src="../../../assets/images/attendance/attendance-cap.svg" alt=""/></figure>
            <span class="no-search-data">{{getScreenText("NO_SEARCH_DATA")}}</span>
          </div>
          
          <div class="pagination-holder" v-show="isPaginatioShow() &&dataLoaded &&!searchNoContentCase">
            <pagination :isShow="true" :noOfRowsForMobile="noOfRowsForMobile" :isMobileForAPiCall="isMobileForAPiCall" :isMobile="mobileView" :total_items="scholarsSearchCount?scholarsSearchCount:0" @page="getDataForPage($event)" :pageChangeUp="pageMove" :type="'roster'"></pagination>           </div>
          </div>
          
      <div v-if="no_data_roaster=='enable'&& !onLoadData" class="empty-state">
        <div class="message">{{getScreenText("NO_DATA_ROASTER_PART")}}</div>
      </div>
    
       <div v-if="componentName=='repair-table'" class="backcontbuttonwrapper">

             <button class="btn-secondary mr-16" bx-attr="nav-back-button" @click="navStep">{{getScreenText("BTN_BACK")}}</button>

             <button v-if="(unresolvedStep3Validations.length!==0 || issuesContainer.length!==0)||scholarsSearchCount==0" :class="['btn-primary','disable']" bx-attr="nav-continue-button"  @click="checkRevisonsMade('')">{{getScreenText("BTN_CONTINUE")}}</button>
              <button bx-attr="nav-checkRevisonsMade-button" v-else :class="['btn-primary']"  @click="checkRevisonsMade('')">{{getScreenText("BTN_CONTINUE")}}</button>
             
       </div>
       <div v-else-if="componentName=='error_screen'" class="backcontbuttonwrapper">
          <br />
          <br />
       </div>
        
       
      </div>




  <div id="unresoved-issue" v-show="popupStatus" class="uk-flex-top popupwrapper" uk-modal>
      <div class="uk-modal-dialog uk-margin-auto-vertical popupbox">
        
        <div class="popup-header">
            <button class="cross-icon" type="button">
                <img src="../../../assets/images/closeIcon.svg" bx-attr="closePopup-unresolved-button" alt @click="closePopup" />
            </button>
            <h1 class="">{{issuesContainer.length==0 ? getScreenText("ALL_ISSUES_FIXED") :getScreenText("LABEL_STEP_2_ROSTER_UNRESOLVED_POPUP_TITLE")}}</h1>
        </div>
        <div class="popup-context-box">
            <div class="popup-context-box-inner">
                <div class="fix">
                      <figure>
                         <img  src="../../../assets/images/scholars/add-new-scholars/cap.svg" alt=""/>
                      </figure>
                      <p v-if="issuesContainer.length!==0">{{getScreenText("PENDING_CHANGES_MSG_1")}}</p>
                      <p v-if="issuesContainer.length!==0"><span>{{(issuesContainer.length)+' '+getScreenText("PENDING_CHANGES_MSG_2")}} </span></p>
                      <p v-if="issuesContainer.length==0" class="margin-zero">{{getScreenText("NICE_WORK")}}</p>
                      <p v-if="issuesContainer.length==0" class="margin-zero">{{getScreenText("COMPLETED_UPLOADING_ROASTER_MSG1")}}</p>
                      <p v-if="issuesContainer.length==0" class="margin-zero">{{getScreenText("COMPLETED_UPLOADING_ROASTER_MSG2")}}</p>
                </div>

                <div class="button-wrapper">
                     <button  type="button" class="btn-secondary  mr-8" bx-attr="edit-again-button" @click="closePopup">{{getScreenText("BTN_EDIT_AGAIN")}}</button>
                     <button  type="button" class=" btn-primary ml-8 padding-next-btn" bx-attr="continue-button" @click="moveToFinalStep">{{getScreenText("BTN_NEXT")}}</button>
                </div>
            </div>
        </div>
      </div>
    </div>
    </div>



    
<div class="floating-button" v-if="mobileView && roleId!=7">
      <img v-if="!isSignalRProcessing" src="../../../assets/images/floting-icon.svg" alt="" @click="openAddPanel(true)" />
      <img v-else src="../../../assets/images/floting-icon-grey.svg" alt="" />
    </div>

<popup-wrapper ref="filterPanels" :transitionType="'left-to-right'">
  <template v-slot:popupcontent>
 <div id="offcanvas-flip-searchPopup" v-if="mobileView">
    <div >
      <button  class="close-icon" type="button" bx-attr="closeSearchPopup-button" @click='closeSearchPopup' >
       <img src="../../../assets/images/closeIconBlack.svg" alt="" />
      </button>
      <div class="add-new-sec">
       <div  class="clearfix">
        <p class="filter-sidepanel">{{getScreenText('FILTER')}}</p>
        <div class="search-box">
              <span  v-if="!isShowCrossIcon"  class='search-icon' bx-attr="searchQuery-button" @click="searchQuery(mobileQuery)">
                <img alt="search" src="../../../assets/images/common-icon/search.svg" />
              </span>
              <span  v-if="isShowCrossIcon"  class='search-icon' bx-attr="closeQuery-button" @click="closeQuery">
                <img alt="search" class="close-img" src="../../../assets/images/common-icon/closeIconBlack.svg"/>
              </span>
              <input ref="filterSearchBox" bx-attr="popup-search-input" class="input" placeholder="Search" v-model="mobileQuery" v-on:keyup.enter="checkEnterSearch"  > 
            </div>
        <p class="filter-label">{{getScreenText('DISPLAY_FILTER')}} </p>
        <div class="form-dropdown width-fix" v-click-outside="()=>{openDropStatus =false}">
                     <div tabindex="1" class="form-dropdown-title" 
                      @keyup.enter="openDropdown()" 
                      @keydown.tab="openDropdown(true)"
                      @click="openDropdown()" bx-attr="display-filter-dropdown">
                        <span>
                          <em>
                            <img src="../../../assets/images/scholars/add-new-scholars/arrowDown.svg" alt="" />
                          </em> 
                          <span >{{defaultSelectionDrop}}</span>
                        </span>
                      </div>
                     <div class="dropdown-submenu" v-if="openDropStatus">
                        <ul class="dropdown-submenu-list">
                            <li v-for="(displayName,displayIndex) in displayColumnItems" :key="displayIndex" @click="changeDisplayView(displayName)" :title="displayName">
                              <a >
                                {{displayName}}
                              </a>
                            </li>
                        </ul>
                     </div>
                </div>          
      </div>
      </div>
    </div>
  </div>
  </template>
</popup-wrapper>
</div>
</template>

<script lang="ts">
import RepairTableComponent from "@/components/scholarmanagement/repairTable/RepairTableComponent";
export default RepairTableComponent;
</script>
<style lang="less" src="./RepairTableComponent.less"></style>