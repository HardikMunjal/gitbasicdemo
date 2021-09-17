import { Vue, Component, Emit, Prop } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import DropdownComponent from '@/ui-components/dropdown/DropdownComponent.vue';
import scholar from '@/store/modules/scholarManager'
import APP_CONST from '@/constants/AppConst';
import { getModule } from 'vuex-module-decorators';
import { GlobalModule } from '@/store/global/globalModule';
import store from '@/store';
import UIkit from "uikit";
import { scholarUtility } from '@/utilities/scholarStuff';
import UnresolvedAlertComponent from '@/popupcomponents/unresolvedalertcomponent/UnresolvedAlertComponent.vue';
import UploadProgress from '@/popupcomponents/uploadprogress/UploadProgress.vue';
import BouncingPreloaderComponent from '@/commoncomponents/bouncingpreloadercomponent/BouncingPreloaderComponent.vue';

@Component({
    components: {
        'drop-down': DropdownComponent,
        'unresolved-popup': UnresolvedAlertComponent,
        'upload-progress': UploadProgress,
        'bouncing-preloader': BouncingPreloaderComponent,
    }
})
export default class MatchColumnsComponent extends Vue {
    private objScreenText: ScreenText = new ScreenText();
    selectedCsvLabel: number | null = null;
    selectedBxGroup: number | null = null;
    stickyWrapperBtn: boolean = false;
    getGlobalState = getModule(GlobalModule, store)
    showNotice: boolean = false;
    openPopup: boolean = false;
    progressOpen:boolean = false;
    mappedData:any = [];
    unmappedCsvHeaders:any = [];
    mandatoryHeaders:any = [];
    csvHeaders:any = [];
    bxHeaders:any = [];
    unresolvedRowIndexes:any = [];
    currentUnresolved:number = 0;
    maxCustReached:boolean = false;
    validity:boolean = true;
    dataFetched:boolean = false;
    currnetAddedRow : string = '';
    public disableContinueButton: boolean = false;

    @Prop()
    userDetails!: any;

    @Prop()
    stepId!: number;

    @Emit('next') nextScreen(mode: string) { 
        // This is intentional
    }

    created() {
        this.obtainReqHeaders();
        window.addEventListener('scroll', this.handleScroll);
    }

    get updatemapping(){
        return this.mappedData
    }
   

    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }


    get groupWiseHeaders() {
        return this.getGlobalState.GroupedHeaders;
    }

    get unmappedHeader() {
        return this.getGlobalState.csvUnmappedHeader;
    }

    get enableCustomAddition() {
        return this.getGlobalState.checkCustomAddition;
    }

    get arrayToMatch() {
        return this.getGlobalState.unmappedList;
    }

    get labelTofocus() {
        return this.getGlobalState.labelToFocusOn;
      }

    goToRepairProb() {
        this.disableContinueButton = true;
        this.validity=true;
        /* istanbul ignore else */
       if(this.unresolvedRowIndexes.length>0) {
        this.openPopup = true;
        this.mappedData.forEach((item:any) => {
            if(this.unresolvedRowIndexes.indexOf(item[0].rowIndex)!==-1 && !item.isCustom){
                if(this.mandatoryHeaders.indexOf(item[0].columnName)!==-1){
                 this.validity = false;
                }
            }
        })
        setTimeout(() => {
            /* istanbul ignore else */
            if (UIkit.modal('#unresoved-popup')) {
                UIkit.modal('#unresoved-popup').show();
                this.disableContinueButton = false;
            }
       },1000);
       } else {
        this.validity=true;
        this.progressOpen =true;
        this.moveNext();
       }
    }

    close() {
        this.openPopup = false;
        this.progressOpen = false;
        setTimeout(() => {
        if (UIkit.modal('#unresoved-popup')) {
            let element:any = document.querySelectorAll('#unresoved-popup');
            UIkit.modal('#unresoved-popup').hide();
            element[1]&& element[1].remove();
            element[2]&& element[2].remove();
        }
    },1000);
    }

    moveNext() {
        this.openPopup = false;
        this.progressOpen = false;
        const configureObj: {
            "siteId": number,
            "isFinalSubmit": boolean,
            "rosterStep": number,
            "step2": any[],
        } = {
            "siteId": this.getGlobalState.siteId,
            "isFinalSubmit": false,
            "rosterStep": 3,
            "step2": [],
        }
        setTimeout(() => {
            scholar.configureScholarRoaster(configureObj).then((response: any) => {
        // This is intentional
            })
            /* istanbul ignore else */
            if (UIkit.modal('#unresoved-popup')) {
                let element:any = document.querySelectorAll('#unresoved-popup');
                UIkit.modal('#unresoved-popup').hide();
                element[1]&& element[1].remove();
                element[2]&& element[2].remove();
            }
            this.nextScreen('repair-table');
            this.disableContinueButton = false;
        }, 1200)
    }

    backToUpload() {
        this.openPopup = false;
        this.nextScreen('upload-file');
    }

    obtainHeaders(mandatoryHeaders: any) {
        
        const siteId = this.userDetails.siteId;
        if (!siteId) {
            return;
        }
        scholar.getAllHeaders(siteId).then((headersRes: any) => {
            if(headersRes && headersRes.data && headersRes.data.name && headersRes.data.name=='Error_CsvHeaderColumns'){
                this.validity = false;
            }
            /* istanbul ignore else */
            if (headersRes.status === APP_CONST.RESPONSE_200) {
              
                let bxHeaders:any = headersRes.data.bxHeaders;
                let csvHeaders:any = headersRes.data.csvHeaders;
                this.csvHeaders = JSON.parse(JSON.stringify(csvHeaders));
                this.bxHeaders = JSON.parse(JSON.stringify(bxHeaders));
                this.mandatoryHeaders = mandatoryHeaders;
                let prepareMappedData:any = [];
                bxHeaders.forEach((element:any) => {
                    let singleMappedData:any = [];
                    let valuesToCheck:any = element.columnSynonyms?[...element.columnSynonyms,element.columnName]:[element.columnName];
                    let mappedArray:any = [];
                    csvHeaders.forEach((csvObj:any) => {
                        if(valuesToCheck.length&&valuesToCheck.map((item:any) => item.toLowerCase().trim()).indexOf(csvObj.columnName.toLowerCase().trim()) !==-1){
                          mappedArray.push(csvObj);
                        }
                    })
                    if(mappedArray.length){
                        let indexToRemove:any = csvHeaders.findIndex((headerCheck:any) =>headerCheck.rowIndex ==mappedArray[0].rowIndex);
                        indexToRemove!==-1 && (csvHeaders.splice(indexToRemove,1));
                    }
                    singleMappedData.push(element,mappedArray.length?mappedArray[0]:{columnName:'Select'}); 
                    prepareMappedData.push(singleMappedData);
                });
                this.mappedData = prepareMappedData;
                let mappedHeaders:any = [];
                this.mappedData.forEach((item:any) => {
                    if(item[1].columnName!=='Select'){
                        mappedHeaders.push(item[1].rowIndex);
                    }
                })
                let newCsvHeaders:any = [];
                csvHeaders.forEach((item:any) => {
                    if(mappedHeaders.indexOf(item.rowIndex)==-1){
                        newCsvHeaders.push(item);
                    }
                })
                let indexFinder:any = newCsvHeaders.filter((item:any) => item.columnName=='Select');
                /* istanbul ignore else */
                if(indexFinder.length != 1){
                    newCsvHeaders.unshift({columnName:'Select'});
                }
                this.unmappedCsvHeaders = newCsvHeaders;
                let unresolvedRowIndexes:any = [];
                this.mappedData.forEach((item:any) => {
                    if(item[1]&&(item[1].columnName=='Select')){
                        unresolvedRowIndexes.push(item[0].rowIndex);
                    }
                }); 
                this.unresolvedRowIndexes = unresolvedRowIndexes;
                this.dataFetched = true;
                /* istanbul ignore else */
                if(this.unresolvedRowIndexes.length>0) {
                    this.validity = true;
                     this.mappedData.forEach((item:any) => {
                         if(this.unresolvedRowIndexes.indexOf(item[0].rowIndex)!==-1 && !item.isCustom){
                             if(this.mandatoryHeaders.indexOf(item[0].columnName)!==-1){
                              this.validity = false;
                             }
                         }
                     })
                 }
                /* istanbul ignore else */
                if (this.mappedData && this.mappedData.length > 0 && this.mappedData[17].length > 0) {
                    this.mappedData[17][0].groupName = 'Address';
                }
                if (this.stepId < 1) {
                   this.saveAutoRoaster(true);
                   this.dataFetched = true;
                } else {
                    this.getAutoSave(siteId);
                }
            }
        })
    }

    obtainReqHeaders() {
        scholar.bxrequiredHeaders().then((response: any) => {
            /* istanbul ignore else */
            if (response.status === APP_CONST.RESPONSE_200) {
                const mandatoryHeaders = response.data.headerNames;
                this.obtainHeaders(mandatoryHeaders);
            }
        })
    }

    fillUnMappedList(obj:any){
        if(obj.rowIndex){
           let indexFind:any = this.unmappedCsvHeaders.findIndex((item:any) => item.rowIndex == obj.rowIndex);
           /* istanbul ignore else */
           if(indexFind==-1){
               /* istanbul ignore else */
               if(obj.maxCustReached){
                   this.maxCustReached = false
               }
               delete obj.maxCustReached;
             this.unmappedCsvHeaders.push(obj);
           }
        }
        else if(!obj.rowIndex && obj.maxCustReached){
            /* istanbul ignore else */
            if(obj.maxCustReached){
                this.maxCustReached = false
            }
            delete obj.maxCustReached;
        }
        else{
            if(obj.value.columnName == 'Select' && obj.label.columnName == 'Select'){
                return;
            }
            else if(obj.value.columnName == 'Select'&& obj.label.columnName !== 'Select'){
                /* istanbul ignore else */
                if(obj.label.rowIndex){
                    this.mappedData.forEach((mapData:any) => {
                        if(mapData[1].rowIndex&&(mapData[0].rowIndex==obj.headerRowIndex)){
                            mapData[1] = {columnName:'Select'};
                            mapData[1].isManuallyMapped = false;

                            if(mapData[0].isCustom&&mapData[1].columnName!=='Select'){
                                if(mapData[0].isCustomNewlyCreated){
                                    mapData[0].columnName = mapData[1].columnName;
                                }
                            }
                            else if(mapData[0].isCustom&&mapData[1].columnName=='Select'){
                                if(mapData[0].isCustomNewlyCreated){
                                    mapData[0].columnName = 'Custom';
                                }
                            }
                            let checkInUnmapped:any= this.unmappedCsvHeaders.findIndex((header:any) => header.rowIndex==obj.label.rowIndex);
                            if(checkInUnmapped==-1|| this.unmappedCsvHeaders.length==0){
                                this.unmappedCsvHeaders.push(obj.label);
                            }
                        }
                    })
                }
            }
            else {
                if(obj.label.rowIndex&& obj.value.rowIndex){
                    this.mappedData.forEach((mapData:any) => {
                        if(mapData[1].rowIndex&&(mapData[0].rowIndex==obj.headerRowIndex)){
                            mapData[1] = obj.value;
                            mapData[1].isManuallyMapped = true;
                            let checkInUnmapped:any= this.unmappedCsvHeaders.findIndex((header:any) => header.rowIndex==obj.label.rowIndex);
                            if(checkInUnmapped==-1){
                                this.unmappedCsvHeaders.push(obj.label);
                                let removeUnMappedOneIndex:any =this.unmappedCsvHeaders.findIndex((headerCheck:any) => headerCheck.rowIndex==obj.value.rowIndex);
                                this.unmappedCsvHeaders.splice(removeUnMappedOneIndex,1);
                            }
                            if(mapData[0].isCustom&&mapData[1].columnName!=='Select'){
                                if(mapData[0].isCustomNewlyCreated){
                                    mapData[0].columnName = mapData[1].columnName;
                                }
                            }
                            else if(mapData[0].isCustom&&mapData[1].columnName=='Select'){
                                if(mapData[0].isCustomNewlyCreated){
                                    mapData[0].columnName = 'Custom';
                                }
                            }
                        }
                    })
                }
                else {
                    /* istanbul ignore else */
                    if(!obj.label.rowIndex){
                        this.mappedData.forEach((mapData:any) => {
                            if(mapData[0].rowIndex==obj.headerRowIndex){
                                mapData[1] = obj.value;
                                mapData[1].isManuallyMapped = true;
                                let removeUnMappedOneIndex:any =this.unmappedCsvHeaders.findIndex((headerCheck:any) => headerCheck.rowIndex==obj.value.rowIndex);
                                this.unmappedCsvHeaders.splice(removeUnMappedOneIndex,1);
                                if(mapData[0].isCustom&& mapData[1].columnName!=='Select'){
                                    if(mapData[0].isCustomNewlyCreated){
                                        mapData[0].columnName = mapData[1].columnName;
                                    }
                                }
                                else if(mapData[0].isCustom&&mapData[1].columnName=='Select'){
                                    if(mapData[0].isCustomNewlyCreated){
                                        mapData[0].columnName ='Custom';
                                    }
                                }
                            }
                        })
                    }
                }
            }
        }
   
    let unresolvedRowIndexes:any = [];
    this.mappedData.forEach((item:any) => {
        if(item[1].columnName=='Select'){
            unresolvedRowIndexes.push(item[0].rowIndex);
        }
    }); 
    this.unresolvedRowIndexes = unresolvedRowIndexes;
    this.currentUnresolved = unresolvedRowIndexes.length == this.currentUnresolved ? this.currentUnresolved : 0;
    /* istanbul ignore else */
    if(this.unresolvedRowIndexes.length>0) {
       this.validity = true;
        this.mappedData.forEach((item:any) => {
            if(this.unresolvedRowIndexes.indexOf(item[0].rowIndex)!==-1 && !item.isCustom){
                if(this.mandatoryHeaders.indexOf(item[0].columnName)!==-1){
                 this.validity = false;
                }
            }
        })
    }
    if(this.unresolvedRowIndexes.length==0){
        this.validity = true;
    }
    }

    handleScroll(event: any) {
        if (window.scrollY>420) {
            this.stickyWrapperBtn = true;
        } else {
            this.stickyWrapperBtn = false;
        }
    }

    prevLabel() {
        if(this.currentUnresolved!==0&&this.currentUnresolved<=this.unresolvedRowIndexes.length){
            this.currentUnresolved = this.currentUnresolved-1;
            this.navigateToLabel(this.unresolvedRowIndexes[this.currentUnresolved-1]);
        }
        /* istanbul ignore else */
        if(this.currentUnresolved==0){
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextLabel() {
        if(this.currentUnresolved<=this.unresolvedRowIndexes.length-1){
            this.currentUnresolved = this.currentUnresolved+1;
            this.navigateToLabel(this.unresolvedRowIndexes[this.currentUnresolved-1]);
        }      
    }

    navigateToLabel(focusedLabel: string) {
        const element = document.getElementById(focusedLabel) as HTMLElement;
        if(element) {
            window.scrollBy({
                top: element.getBoundingClientRect().top -APP_CONST.KEY_210,
                behavior: 'smooth'
            })
        }
    }

    addCustomColumns() {
        let customLength:any = this.mappedData.filter((item:any) => item[0].isCustom == true);
        setTimeout(() => {
            this.wrapThis(document.querySelectorAll('.CustomFields'),'custom');
        },500);
        /* istanbul ignore else */
        if(customLength.length<=5){
            this.maxCustReached = false;
            let bxObj:any = {
                columnName: "Custom",
                columnSynonyms: [],
                groupName: "Custom Fields",
                index:0,
                isCustom:true,
                isCustomNewlyCreated:true,
                rowIndex:'',
            }
            let csvObj:any = {
                columnName: 'Select'
            }
            let mappedLength:any = this.mappedData.length-1;
            let lastRowCalculate:any = this.mappedData[mappedLength][0];
            const rowIndex = scholarUtility.generateAlphabets(lastRowCalculate.rowIndex);
            this.currnetAddedRow = rowIndex;
            bxObj.rowIndex = rowIndex;
            let singleMappedArray:any = [];
            singleMappedArray.push(bxObj,csvObj);
            this.mappedData.push(singleMappedArray);
            this.csvHeaders.push(csvObj);
            this.bxHeaders.push(bxObj);
            this.saveAutoRoaster();
        }
        else{
            this.maxCustReached = true;
        }       
    }

    

    saveAutoRoaster(firstTimeLoad? : boolean) {
        const configureObj: {
            "siteId": number,
            "isFinalSubmit": boolean,
            "rosterStep": number,
            "step2": any[],
        } = {
            "siteId": this.getGlobalState.siteId,
            "isFinalSubmit": false,
            "rosterStep": 2,
            "step2": [],
        }
        let step2ArrayFill:any = [];

        this.mappedData.forEach((item:any) => {
               let obj:any ={
                   bxLabel:item[0].columnName,
                   csvLabel: item[1].columnName,
                   isCustom: item[0].isCustom? true:false,
                   isManuallyMapped: item[1].isManuallyMapped?true:false,
                   rowIndex: item[0].rowIndex,
                   csvRowIndex:item[1].rowIndex?item[1].rowIndex:''
               }
               step2ArrayFill.push(obj);          
        })
       
         configureObj.step2 = step2ArrayFill;

        scholar.configureScholarRoaster(configureObj).then((response: any) => {
            this.updateUnresolvedCount(firstTimeLoad)
        })
    }
 
    updateUnresolvedCount(firstTimeLoad?:boolean){
        let unresolvedRowIndexes:any = [];
            this.mappedData.forEach((item:any) => {
                if(item[1]&&(item[1].columnName=='Select')){
                    unresolvedRowIndexes.push(item[0].rowIndex);
                }
            }); 
            this.unresolvedRowIndexes = unresolvedRowIndexes;
            this.dataFetched = true;
            /* istanbul ignore else */
            if(this.unresolvedRowIndexes.length>0) {
                this.validity = true;
                 this.mappedData.forEach((item:any) => {
                     if(this.unresolvedRowIndexes.indexOf(item[0].rowIndex)!==-1 && !item.isCustom){
                         if(this.mandatoryHeaders.indexOf(item[0].columnName)!==-1){
                          this.validity = false;
                         }
                     }
                 })
             }
             if(firstTimeLoad){
                this.getAutoSave(this.userDetails.siteId);
             }
    }
    getAutoSave(siteId: number) {
        scholar.getStep2AutoSave({ siteId, step: 2 }).then((autoSaveRes: any) => {
            /* istanbul ignore else */
            if (autoSaveRes.status === APP_CONST.RESPONSE_200 && autoSaveRes.data.step2.length > 0) {
                const step2Data = autoSaveRes.data.step2;
                const bxHeader:any = JSON.parse(JSON.stringify(this.bxHeaders));
                const bxHeaders:any =bxHeader.filter((item:any) => item.isCustom==false)
                let csvHeaders:any = JSON.parse(JSON.stringify(this.csvHeaders));
                let prepareMappedData:any = [];
                let customsToAdd:any = step2Data.filter((item:any) => item.isCustom==true);
                customsToAdd.forEach((customObj:any)=> {
                    if(step2Data.length>bxHeaders.length){
                    bxHeaders.push({
                        columnName:customObj.bxLabel,
                        columnSynonyms: [],
                        groupName: "Custom Fields",
                        index:0,
                        isCustom:true,
                        rowIndex:customObj.rowIndex
                    });
                    csvHeaders.push({columnName: customObj.csvLabel,
                    groupName: "Custom Fields",
                    index: 0,
                    isCustom: true,
                    rowIndex:customObj.csvRowIndex });
                    }
                })

                bxHeaders.forEach((element:any) => {
                    let singleMappedData:any = [];
                    let mappedIndex:any = step2Data.findIndex((item:any) => item.rowIndex == element.rowIndex);

                    /* istanbul ignore else */
                    if(mappedIndex!==-1){
                        let isManuallyMapped:any = step2Data[mappedIndex].isManuallyMapped;
                        let csvIndex:any = csvHeaders.findIndex((item:any) => step2Data[mappedIndex].csvRowIndex == item.rowIndex);
                        if(csvIndex!==-1){
                            let objectForm:any = {...csvHeaders[csvIndex],isManuallyMapped:csvHeaders[csvIndex].columnName=='Select'?false:isManuallyMapped}
                            singleMappedData.push(element,objectForm);
                            csvHeaders.splice(csvIndex,1);
                        }
                        else{
                            singleMappedData.push(element,{columnName:'Select',isManuallyMapped:false});
                        }
                    } 
                    prepareMappedData.push(singleMappedData);
                });
                this.mappedData = prepareMappedData.filter((item:any) => item.length!==0);
             
                let mappedHeaders:any = [];
                step2Data.forEach((item:any) => {
                    if(item.csvRowIndex&&item.csvRowIndex!==''){
                        mappedHeaders.push(item.csvRowIndex);
                    }
                })
                let newCsvHeaders:any = [];
                this.csvHeaders.forEach((item:any) => {
                    if(mappedHeaders.indexOf(item.rowIndex)==-1){   
                        newCsvHeaders.push(item);
                    }
                })
                let indexFinder:any = newCsvHeaders.filter((item:any) => item.columnName=='Select');
                /* istanbul ignore else */
                if(indexFinder.length != 1){
                    newCsvHeaders.unshift({columnName:'Select'});
                }
                this.unmappedCsvHeaders = newCsvHeaders;
                let unresolvedRowIndexes:any = [];
                this.mappedData.forEach((item:any) => {
                    if(item[1]&&(item[1].columnName=='Select')){
                        unresolvedRowIndexes.push(item[0].rowIndex);
                    }
                }); 
                this.unresolvedRowIndexes = unresolvedRowIndexes;
                this.dataFetched = true;
                
                /* istanbul ignore else */
                if(this.unresolvedRowIndexes.length>0) {

                    this.validity = true;
                     this.mappedData.forEach((item:any) => {
                         if(this.unresolvedRowIndexes.indexOf(item[0].rowIndex)!==-1 && !item.isCustom){
                             if(this.mandatoryHeaders.indexOf(item[0].columnName)!==-1){
                              this.validity = false;
                             }
                         }
                     })
                 }
            
            }
        })
    }


    openTooltip() {
        const toolTipObject: any = document.getElementById(APP_CONST.TOOL_TIP);
        if(toolTipObject){
            /* istanbul ignore else */
            if (!toolTipObject.style.visibility || (toolTipObject.style.visibility === APP_CONST.HIDDEN)) {
                toolTipObject.style.visibility = APP_CONST.VISIBLE;
            }
        }
        
    }

    closeTooltip() {
        const toolTipObject: any = document.getElementById(APP_CONST.TOOL_TIP);
        if(toolTipObject){
            toolTipObject.style.visibility = APP_CONST.HIDDEN;
        }
        
    }

    wrapThis(arrayEl:any,type:string=''){
        let addedToDocument = false;
        let nodesToWrap:any = arrayEl;
        let wrapper = document.createElement("div");
        wrapper.id = "form-row-wrapper";
            /* istanbul ignore else */
        if(type=='custom'){
            /* istanbul ignore else */
            if(document.querySelectorAll('#custom-heading').length==0){
                let headingTag:any =  document.createElement("h3");
                headingTag.id="custom-heading";
                headingTag.textContent = 'Custom';
                wrapper.appendChild(headingTag);
            }
        }
        for (var index = 0; index <=nodesToWrap.length; index++) {
            let node:any = nodesToWrap[index];
            /* istanbul ignore else */
            if (! addedToDocument) {
                node&&node.parentNode&&(node.parentNode.insertBefore(wrapper, node));
                node&&node.parentNode&&(addedToDocument = true);
            }
            /* Reserve code will be removed  
            // node&&node.parentNode&&(node.parentNode.removeChild(node));
            // node&&wrapper.appendChild(node);
            */  
        }
    }

    mounted(){
        setTimeout(() => {
            let containerComp:any = document.querySelectorAll('div.components_container > div');
            this.wrapThis([containerComp[2],containerComp[3]]);
            this.wrapThis([containerComp[18]]);
            this.wrapThis(document.querySelectorAll('custom-column'));
           let classesFinder:any = [".ScholarIDs",".Scholarinfo",".Status",".Address",".Family",".Emergency",".Medical",".LearningStatus",".Consentforms"];
           let headingTagger:any = ["Scholar ID","Scholar Info","Status","Address","Family","Emergency Info","Medical","Learning Status","Consent Forms"];
           classesFinder.forEach((itemNew:any,indexUp:any) => {
            let addedToDocument = false;
            let wrapper = document.createElement("div");
            wrapper.id = "form-row-wrapper";
            let nodesToWrap = [...document.querySelectorAll(itemNew)];
            let headingTag:any =  document.createElement("h3");
            headingTag.textContent = headingTagger[indexUp];
            wrapper.appendChild(headingTag);
        for (var index = 0; index <=nodesToWrap.length; index++) {
                    let node:any = nodesToWrap[index];
                    /* istanbul ignore else */
                    if (!addedToDocument) {
                        node&&node.parentNode&&(node.parentNode.insertBefore(wrapper, node));
                        node&&node.parentNode&&(addedToDocument = true);
                    }
                    node&&node.parentNode&&(node.parentNode.removeChild(node));
                    node&&wrapper.appendChild(node);  
        }
           })
           this.wrapThis(document.querySelectorAll('.CustomFields'),'custom');
        },2500)
      
    }

    destroyed() {
        window.removeEventListener('scroll', this.handleScroll);
    }

}