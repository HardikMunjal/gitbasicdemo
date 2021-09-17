import { Vue, Component, Emit, Watch, Prop } from 'vue-property-decorator';
import APP_CONST from '@/constants/AppConst';
import API_CONST from '@/constants/ApiConst';
import UIkit from "uikit";

import RoasterPanel from '@/popupcomponents/roasterpanel/RoasterPanel.vue';
import { IRepairColumn } from '@/Model/programModel';
import { getRoasterTable, getRoasterErrorTable, deleteRoasterErrorTable } from "@/services/userService/users-api";
import { deleteBulkRoaster, downloadRoaster } from '@/services/scholar/scholarService'
import scholar from '@/store/modules/scholarManager';
import APP_UTILITIES from '@/utilities/commonFunctions';
import PaginationComponent from '../../../commoncomponents/paginationcomponent/PaginationComponent.vue';
import { ScreenText } from '@/lang/ScreenText';
import { getModule } from 'vuex-module-decorators';
import { GlobalModule } from '@/store/global/globalModule';
import store from '@/store';
import NoDataFoundComponent from '@/commoncomponents/nodatafoundcomponent/NoDataFoundComponent.vue';
import AddScholarConfirmation from '@/popupcomponents/addscholarconfirmation/AddScholarConfirmation.vue';
import DuplicateFileConfirmation from '@/popupcomponents/FileNameconfirmation/FileNameconfirmation.vue';
import DeleteRosterConfirmation from '@/popupcomponents/DeleteRosterConfirmation/DeleteRosterConfirmation.vue';
import LocalStorage from "@/utilities/localStorageUtil";
import BouncingPreloaderComponent from '@/commoncomponents/bouncingpreloadercomponent/BouncingPreloaderComponent.vue';
import PopupWrapperComponent from '@/commoncomponents/popupwrapper/PopupWrapperComponent.vue';
import * as signalR from "@microsoft/signalr";
import { readSync } from 'node:fs';

@Component({
    components: {
        'add-scholar': RoasterPanel,
        'pagination': PaginationComponent,
        'no-data-found': NoDataFoundComponent,
        'add-scholar-popup': AddScholarConfirmation,
        'duplicate-file-popup': DuplicateFileConfirmation,
        'deleteRosterConfirmation': DeleteRosterConfirmation,
        'bouncing-preloader': BouncingPreloaderComponent,
        'popup-wrapper': PopupWrapperComponent        
    }
})
export default class RepairTableComponent extends Vue {
    public scrollTimeout:any = {};
    private oldRowItemsRoaster: Array<any> = [];
    private rowItemsRoaster: Array<any> = APP_CONST.ROW_ROASTER;
    private columnsRoaster: Array<IRepairColumn> = JSON.parse(JSON.stringify(APP_CONST.SCHOLAR_COLUMN_ROSTER));
    private apiTableDetails: any = [];
    private sortedColumns: any = [];
    private customIndexes: Array<number> = [];
    private sortArrayIndexes: any = []
    private displayColumnItems: Array<string> = APP_CONST.DISPLAY_COLUMNS;
    private defaultSelectionDrop: string = 'Scholar Info';
    private currentDblClickedCell: string = '';
    private oldValue: string = '';
    private singleClickedCell: string = '';
    private issuesContainer: Array<any> = [];
    private rowCheckEmpty: any = [];
    private skipPopupDisplay: boolean = false;
    private requiredPopupDisplay: boolean = false;
    private openDropStatus: boolean = false;
    private arrowIssueClicked: string = '';
    private dynamicScrollableClass: string = '';
    private classRoomOptions: Array<string> = APP_CONST.CLASSROOM_OPTIONS;
    private customOptions: Array<string> = APP_CONST.CUSTOM_OPTIONS;
    private query: string = '';
    private mobileQuery: string = '';
    private scholarName: string = '';
    private dateValue: string = '';
    private rowsToShow: any = [];
    private emailFields: any = ['familyContact#1Email', 'familyContact#2Email'];
    private dateFields: any = ['inactiveDate', 'enrollmentDate', 'birthDate', 'siteStartDate', 'siteEndDate'];
    private phoneNumberFields: any = ['home#', 'emergencyContactPrimaryPhone', 'emergencyContactSecondaryPhone', 'familyContact#1Phone', 'familyContact#2Phone'];
    private emailCheck: any = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    private fixUnresolved: boolean = false;
    private skipCount: number = 0;
    private popupStatus: boolean = false;
    private revisionsObject: any = {};
    private beforeActiveIssueObj: any = {};
    private objScreenText: ScreenText = new ScreenText();
    private hovering: string = '';
    private currentHoveredCell: string = '';
    private hoverStyleObj: any = {};
    private hoveredCellValue: any = '';
    public openCreatePanel: boolean = false;
    public actionType: boolean = false;
    public editRosterData: any = {};
    public editScholarPanels: any = {};
    public editScholarData: any = {};
    public scholarRowData: any = {};
    public editableRow: any = {};
    public panelTitle: string = '';
    public idsAccumulator: any = [];
    public rowIds: any = {};
    public step5ParametersStore: any = {};
    public ActiveScholarsCount: number = 0;
    public sortDir: number = 1;
    public scholarsSearchCount: number = 0;
    public isSearchFocused: boolean = false;
    public currentPage: any = 0;
    public goPage: any = '';
    private unresolvedStep3Validations: Array<any> = [];
    public activeCountScholars: number = 0;
    public no_data_roaster: string = '';
    public isSearching: boolean = false;
    public onLoadData: boolean = false;
    public searchNoContentCase: boolean = false;
    public disableViewRoster: boolean = false;
    public pageMove: any = {
        isPageChange: false,
        pageIndex: 0
    }
    public isStep5moved: boolean = false;
    public correctPage: number = 1;
    public today: string = "";
    public oldStatus: string = "";
    getGlobalState = getModule(GlobalModule, store);
    public dataLoaded: boolean = false;
    public familyArray: Array<any> = [];
    public emergencyArray: Array<any> = [];
    public step5Scholars: Array<any> = [];
    private firstNameSorted: boolean = false;
    private lastNameSorted: boolean = false;
    private birtDaySorted: boolean = false;
    order: number = 1;
    sortField: string = '';
    private sortAsc: string = '1';
    private sortDesc: string = '2';
    private sortRequired: boolean = false;
    private mobileView: boolean = false;
    private isMobileForAPiCall: boolean = false;
    private noOfRowsForMobile: number = 10
    public isShowCrossIcon: boolean = false;
    public toggleDropDown: boolean = false;
    public dropDwonMenu: Array<string> = ['Add Individual Scholar', 'Bulk Upload', 'Delete and Start Over']
    public selectedDropValue: string = 'ADD NEW';
    private authKey: string = "";
    private sortFieldTitle = "";
    public showDeleteToastMsg: boolean = false;
    public autoSaveValue : boolean = false;
    public isChrome:boolean = false;
    private lastSortedHeader: any;
    lastSortedIndex: number = 0
    private errorAlreatDeleted: boolean = false;
    private step5DataAdded:boolean = false;
    //public isSignalRProcessing:boolean=false;
    headerValuesToConsider:any=[];
    @Emit('next') nextScreen(mode: string, revisionsObj: {}) {
        //This is intentional
    }
    @Emit('navigateStepper') navStepper(step: any) {
        //This is intentional
    }
    @Prop()
    signalRStrip!:{component:string,stripShow:boolean,stripText:string}

    @Prop()
    isSignalRProcessing!: boolean;

    @Prop()
    componentName!: any;

    @Prop()
    navigateStepper!: any

    @Prop()
    userDetails: any;

    @Prop()
    roleId!: number

    get firstHeder(){
        const filteredColumn=this.columnsRoaster.filter((clm)=>['firstName', 'lastName'].includes(clm.columnName));
        return filteredColumn;
    }

    get secondHeader(){
        const filteredColumn=this.columnsRoaster.filter((clm)=>!['firstName', 'lastName'].includes(clm.columnName));
        return filteredColumn;
    }

    get firstBody(){
        const filteredColumn=this.rowItemsRoaster.map(({firstName, lastName}) => ({firstName, lastName}));
        return filteredColumn;
    }

    get secondBody(){
        const filteredColumn=JSON.parse(JSON.stringify(this.rowItemsRoaster));
        filteredColumn.forEach((item:any)=>{
            delete item.firstName;
            delete item.lastName;
        })
        return filteredColumn;
    }
    mounted() {
        this.removeErrorStrip();
        document.addEventListener("scroll", this.handleScrollBehaviour);
        this.mobileView = APP_UTILITIES.isMobile()
        window.addEventListener("resize", APP_UTILITIES.debounce(this.isMobile));
        window.addEventListener( 'mousewheel', this.onMouseWheel, false );
        window.addEventListener( 'touchmove', this.onMouseWheel, false );
        this.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);       
    }

    removeErrorStrip(){
        if(this.componentName == "error_screen"){
            this.$emit("signalRStrip",{component:"",stripShow:false,stripText:''})
        }
    }

    onMouseWheel(e:any) {
        var scrollerView:any = document.getElementById('layerWhenScrolling');
        var d = ((typeof e.wheelDelta != "undefined") ? (-e.wheelDelta) : e.detail);
        d = 100 * ((d>0)?1:-1);
        if(scrollerView && scrollerView.classList){
            scrollerView.classList.add("stackingElement");
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(function() {
                scrollerView.classList.remove("stackingElement");
            }, 800);
        }
    }

    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }

    
    isMobile() {
        this.mobileView = APP_UTILITIES.isMobile()
        this.callHoverOut()
        if (this.mobileView === false) {
            this.closeSearchPopup()
        }
        if (this.mobileView) {
            this.closeFilePopup()
        }
    }
    callStep5Table(stepObjNew: any) {
        let columnsRoaster = JSON.parse(JSON.stringify(this.columnsRoaster))
        this.columnsRoaster = columnsRoaster.filter((item: any) => item.columnType.includes("Custom Fields") != true);
        let programId = (this.userDetails.programId === 0) ? APP_UTILITIES.getCookie('programId') : this.userDetails.programId;
        let siteId = this.userDetails.siteId;
        let stepObj = {
            siteId,
            stepNumber: stepObjNew.stepNumber || 5,
            programId,
            page: stepObjNew.page,
            active: stepObjNew.active,
            count: this.isMobileForAPiCall ? this.noOfRowsForMobile : 25,
            search: stepObjNew.search,
            sortField: stepObjNew.sortField,
            sortDir: stepObjNew.sortDir
        }
        this.dataLoaded = false;
        this.step5ParametersStore = stepObj;
        let rowDecider: any = this.rowItemsRoaster.length == 0 ? JSON.parse(JSON.stringify({ ...APP_CONST.ROW_OBJ_TABLE })) : this.rowItemsRoaster[APP_CONST.ZERO];
        rowDecider.bellXcelId.isHidden = true;
        if (rowDecider.documents) {
            rowDecider.documents.isHidden = true;
        }
        let newRowObj = JSON.parse(JSON.stringify({ ...rowDecider }));
        this.rowItemsRoaster = [];
        const getRoasterData = async (k : any) => {
            if(this.componentName == 'error_screen'){

                return getRoasterErrorTable(stepObj);
            } else{

                return getRoasterTable(stepObj);
            }
          };

          getRoasterData(stepObj).then((response: any) => {
            this.dataLoaded = true;
            if (response.status == 204 && this.isSearching && this.onLoadData) {
                this.searchNoContentCase = true;
            }
            if (response.status == 204 && !this.onLoadData) {
                this.no_data_roaster = "enable";
            }
            if (response.status === APP_CONST.RESPONSE_200) {
                this.onLoadData = true;
                this.searchNoContentCase = false;
                this.no_data_roaster = "disable";
                this.idsAccumulator = [];
                Object.keys(newRowObj).forEach((item: any) => {
                    newRowObj[item].value = '';
                })
                let rowObjPrivate = JSON.parse(JSON.stringify({ ...newRowObj }));
                let scholars = response.data.scholars;
                this.step5Scholars = response.data.scholars;
                this.activeCountScholars = response.data.totalActiveScholarsCount;
                this.scholarsSearchCount = response.data.searchCount;
                let newItemsRoaster: any = [];
                let customColumns: any = [];
                for (let i = 0; i < scholars.length; i++) {
                    if (scholars[i].siteCustomHeader) {
                        for (let k in scholars[i].siteCustomHeader) {
                            if (k.indexOf('custom') > -1 && scholars[i].siteCustomHeader[k]) {
                                if (customColumns.indexOf(scholars[i].siteCustomHeader[k]) == -1) {
                                    customColumns.push(scholars[i].siteCustomHeader[k]);
                                }
                            }
                        }
                    }
                }

                for (let cc = 0; cc < customColumns.length; cc++) {
                    let alreadyPushed = false;
                    for (let cr = 0; cr < this.columnsRoaster.length; cr++) {
                        if (this.columnsRoaster[cr].columnName == customColumns[cc]) {
                            alreadyPushed = true;
                        }
                    }
                    if (!alreadyPushed) {
                        let colObject = {
                            columnName: customColumns[cc],
                            columnTitle: customColumns[cc],
                            hasIssue: false,
                            columnType: ['Custom Fields'],
                            isRequired: false,
                            isHidden: false,
                            order: this.checkCustomcolumn(customColumns[cc], 'findIndex') ? stepObjNew.sortDir : 0,
                            columnIndex: cc
                        }
                        this.columnsRoaster[this.columnsRoaster.length] = colObject;
                    }
                }
                scholars.forEach((item: any) => {
                    let newRowObjPrivate = JSON.parse(JSON.stringify(rowObjPrivate));
                    for (let c = 0; c < customColumns.length; c++) {
                        if (item.siteCustomHeader) {
                            for (let j in item.siteCustomHeader) {
                                if (j.indexOf('custom') > -1 && item.siteCustomHeader[j] == customColumns[c]) {
                                    let customValue = '';
                                    customValue = j.replace("custom", "customValue");
                                    newRowObjPrivate[customColumns[c]] = {
                                        value: item.consent[customValue],
                                        issueType: '',
                                        columnType: ['Custom Fields'],
                                        isRequired: false,
                                        isHidden: false,
                                        columnIndex: j
                                    }

                                }
                            }
                        }
                    }
                    Object.keys(item).forEach((itemKey: any) => {
                        if (typeof (item[itemKey]) == 'string' || typeof (item[itemKey]) == 'number' && item[itemKey] !== null) {
                            if (newRowObjPrivate.hasOwnProperty(itemKey)) {
                                if (itemKey == 'status') {
                                    newRowObjPrivate[itemKey].value = (item[itemKey] === 2) ? 'Inactive' : 'Active';
                                }
                                else {
                                    newRowObjPrivate[itemKey].value = item[itemKey];
                                }
                            }
                            else {
                                let stringsMap = ['schoolStudentId', 'homePhone', 'birthday', 'externalScholarId', 'uid', 'documents'];
                                if (stringsMap.indexOf(itemKey) !== -1) {
                                    stringsMap.indexOf(itemKey) == APP_CONST.ZERO && (newRowObjPrivate['studentSchoolIds'] && (newRowObjPrivate['studentSchoolIds'].value = item[itemKey]));
                                    stringsMap.indexOf(itemKey) == APP_CONST.ONE && (newRowObjPrivate['home#'] && (newRowObjPrivate['home#'].value = item[itemKey]));
                                    stringsMap.indexOf(itemKey) == APP_CONST.TWO && (newRowObjPrivate['birthDate'] && (newRowObjPrivate['birthDate'].value = item[itemKey]));
                                    stringsMap.indexOf(itemKey) == APP_CONST.THREE && (newRowObjPrivate['scholarIds'] && (newRowObjPrivate['scholarIds'].value = item[itemKey]));
                                    stringsMap.indexOf(itemKey) == APP_CONST.FOUR && (newRowObjPrivate['bellXcelId'] && (newRowObjPrivate['bellXcelId'].value = item[itemKey]));
                                    stringsMap.indexOf(itemKey) == APP_CONST.FIVE && (newRowObjPrivate['documents'] && (newRowObjPrivate['documents'].value = item[itemKey]));

                                }
                            }
                        }
                        else if (item[itemKey] !== null && typeof (item[itemKey]) == 'object' && !Array.isArray(item[itemKey])) {
                            if (itemKey == 'consent') {
                                let consentsMap = ['scholarInfoForm', 'photoOptOut', 'medicalForm', 'fieldTripForm', 'emergencyForm'];
                                Object.keys(item[itemKey]).forEach((consentKey: any) => {
                                    if (consentsMap.indexOf(consentKey) !== -1) {
                                        consentsMap.indexOf(consentKey) == APP_CONST.ZERO && (newRowObjPrivate['scholarInfoCF'] && (newRowObjPrivate['scholarInfoCF'].value = item[itemKey][consentKey]));
                                        consentsMap.indexOf(consentKey) == APP_CONST.ONE && (newRowObjPrivate['photoVideoOptOut'] && (newRowObjPrivate['photoVideoOptOut'].value = item[itemKey][consentKey]));
                                        consentsMap.indexOf(consentKey) == APP_CONST.TWO && (newRowObjPrivate['medicalCF'] && (newRowObjPrivate['medicalCF'].value = item[itemKey][consentKey]));
                                        consentsMap.indexOf(consentKey) == APP_CONST.THREE && (newRowObjPrivate['fieldTripCF'] && (newRowObjPrivate['fieldTripCF'].value = item[itemKey][consentKey]));
                                        consentsMap.indexOf(consentKey) == APP_CONST.FOUR && (newRowObjPrivate['emergencyCF'] && (newRowObjPrivate['emergencyCF'].value = item[itemKey][consentKey]));
                                    }
                                })
                            }
                            else if (itemKey == 'medical') {
                                let medicalKeysMap = ['asthmaInhaler', 'ellstatus', 'iepstatus', 'medication'];
                                Object.keys(item[itemKey]).forEach((medicalKey: any) => {
                                    if (medicalKeysMap.indexOf(medicalKey) !== -1) {
                                        medicalKeysMap.indexOf(medicalKey) == APP_CONST.ZERO && (newRowObjPrivate['inhaler'] && (newRowObjPrivate['inhaler'].value = item[itemKey][medicalKey]));
                                        medicalKeysMap.indexOf(medicalKey) == APP_CONST.ONE && (newRowObjPrivate['ellStatus'] && (newRowObjPrivate['ellStatus'].value = item[itemKey][medicalKey]));
                                        medicalKeysMap.indexOf(medicalKey) == APP_CONST.TWO && (newRowObjPrivate['iepStatus'] && (newRowObjPrivate['iepStatus'].value = item[itemKey][medicalKey]));
                                        medicalKeysMap.indexOf(medicalKey) == APP_CONST.THREE && (newRowObjPrivate['medications'] && (newRowObjPrivate['medications'].value = item[itemKey][medicalKey]));
                                    }
                                    else if (newRowObjPrivate.hasOwnProperty(medicalKey)) {
                                        newRowObjPrivate[medicalKey].value = item[itemKey] && item[itemKey][medicalKey]
                                    }
                                })
                            }

                            else if (itemKey == 'address') {
                                let addressKeysMap = ['scholarAddress1', 'scholarAddress2', 'zipCode'];
                                Object.keys(item[itemKey]).forEach((addressKey: any) => {
                                    if (addressKeysMap.indexOf(addressKey) !== -1) {
                                        addressKeysMap.indexOf(addressKey) == APP_CONST.ZERO && (newRowObjPrivate['address1'] && (newRowObjPrivate['address1'].value = item[itemKey][addressKey]));
                                        addressKeysMap.indexOf(addressKey) == APP_CONST.ONE && (newRowObjPrivate['address2'] && (newRowObjPrivate['address2'].value = item[itemKey][addressKey]));
                                        addressKeysMap.indexOf(addressKey) == APP_CONST.TWO && (newRowObjPrivate['zip'] && (newRowObjPrivate['zip'].value = item[itemKey][addressKey]));
                                    }
                                    else if (newRowObjPrivate.hasOwnProperty(addressKey)) {
                                        newRowObjPrivate[addressKey].value = item[itemKey][addressKey]
                                    }
                                })
                            }


                        }
                        else if (Array.isArray(item[itemKey]) && item[itemKey] !== null) {
                            if (itemKey == 'families') {
                                item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                                    if (familyObjIndex <= 1) {
                                        let familiesMap = ['firstName', 'lastName', 'phone', 'relationship', 'email', 'allowedToPickup'];
                                        Object.keys(familyObj).forEach((familyKey: any) => {
                                            if (familiesMap.indexOf(familyKey) !== -1) {
                                                familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'] && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.FOUR && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.FIVE && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'] && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'].value = item[itemKey][familyObjIndex][familyKey]));
                                            }
                                        })
                                    }
                                })
                            }
                            else if (itemKey == 'emergencyContacts') {
                                item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                                    if (familyObjIndex == 0) {
                                        let familiesMap = ['firstName', 'lastName', 'phone', 'phoneOther'];
                                        Object.keys(familyObj).forEach((familyKey: any) => {
                                            if (familiesMap.indexOf(familyKey) !== -1) {
                                                familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate['emergencyContactFirstName'] && (newRowObjPrivate['emergencyContactFirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate['emergencyContactLastName'] && (newRowObjPrivate['emergencyContactLastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate['emergencyContactPrimaryPhone'] && (newRowObjPrivate['emergencyContactPrimaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                                familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate['emergencyContactSecondaryPhone'] && (newRowObjPrivate['emergencyContactSecondaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                            }
                                        })
                                    }
                                })
                            }
                        }

                    })
                    newItemsRoaster.push(newRowObjPrivate);
                    let emergencyArray = this.setAmulatorforEmergency(item)
                    let familiesArray = this.setAmulatorforFamilies(item)

                    let scholarRow: any = JSON.parse(JSON.stringify({
                        'id': item.id,
                        'address': {
                            'id': item.address ? item.address.id : 0,
                            'scholarProgramSiteMappingId': item.address ? item.address.scholarProgramSiteMappingId : 0
                        },
                        'consent': {
                            'id': item.consent ? item.consent.id : 0,
                            'scholarProgramSiteMappingId': item.consent ? item.consent.scholarProgramSiteMappingId : 0
                        },
                        'emergencyContacts': emergencyArray,
                        'families': familiesArray,
                        'medical': {
                            'id': item.medical ? item.medical.id : 0,
                            'scholarProgramSiteMappingId': item.medical ? item.medical.scholarProgramSiteMappingId : 0
                        }
                    }));
                    this.idsAccumulator.push(scholarRow);

                })

                this.rowItemsRoaster = newItemsRoaster;

                this.changeDisplayView(this.defaultSelectionDrop);
                this.activeScholars();
            }
        }).catch((err: any) => {
            this.dataLoaded = true;
        })
    }


    getDataForPage(event: any, type = '') {
        /* istanbul ignore else */
        if (!this.isSearchFocused) {
           
            /* istanbul ignore else */
            if ((this.currentPage !== event) || type !== '') {
                if(this.defaultSelectionDrop == 'Scholar Info'){
                    this.defaultSelectionDrop = 'Scholar Info';
                    this.changeDisplayView('Scholar Info');
                }
                else{
                    this.changeDisplayView(this.defaultSelectionDrop);
                }
                this.currentPage = event;
                let componentName = this.componentName;
                let siteId = this.userDetails.siteId ? this.userDetails.siteId : 0;
                let stepNumber = componentName == 'repair-table' ? 3 : componentName == 'error_screen' ? 4 : 5;
                let stepObj = {
                    siteId,
                    stepNumber,
                    id: 0,
                    active: 0,
                    search: '',
                    page: event,
                    count: this.isMobileForAPiCall ? this.noOfRowsForMobile : 25,
                    sortField: (stepNumber == 5 || stepNumber == 4) ? 'ScholarId' : 'First Name',
                    sortDir: 2
                }
                if (stepNumber == 4) {

                    this.dataLoaded = false;
                   this.authKey = APP_UTILITIES.authTokenKeyToManage() ? APP_UTILITIES.authTokenKeyToManage() : "";
                   
                    if(this.authKey){
                        this.getSortingDefaultOnPagination(stepObj)
                    }

                    stepObj.stepNumber = 4;
                    stepObj.sortField = this.sortField;
                    stepObj.sortDir = this.sortDir ? this.sortDir : 1;
                    this.callStep5Table(stepObj)
                }
                else if (stepNumber == 5) {
                    this.sortField = "firstName";
                    this.sortFieldTitle = "First Name";
                    stepObj.stepNumber = 5;
                    stepObj.sortField = this.sortField;
                    stepObj.sortDir = this.sortDir ? this.sortDir : 1;
                    /* istanbul ignore else */
                    if (!this.birtDaySorted && !this.lastNameSorted) {
                        this.firstNameSorted = true;
                    } else if (this.birtDaySorted || this.lastNameSorted) {
                        if (this.birtDaySorted) {
                            stepObj.sortField = "Birthday";
                        } else {
                            stepObj.sortField = "lastName";
                        }
                    }
                    this.dataLoaded = false;

                    this.authKey = APP_UTILITIES.authTokenKeyToManage() ? APP_UTILITIES.authTokenKeyToManage() : "";
                    if (this.authKey) {
                        if (!this.getSortingDefault()) {
                            this.callStep5Table(stepObj)
                        }
                    } else {

                        this.callStep5Table(stepObj)
                    }
                }
                else {
                    this.dataLoaded = false;
                    this.sortField = "firstName";
                    this.sortFieldTitle = "First Name";
                    stepObj.stepNumber = 3;
                    stepObj.sortField = this.sortFieldTitle;
                    stepObj.sortDir = this.sortDir ? this.sortDir : 1;
                    this.getTableData(stepObj)

                }
                if(this.defaultSelectionDrop == 'Scholar Info'){
                    this.defaultSelectionDrop = 'Scholar Info';
                    this.changeDisplayView('Scholar Info');
                }
                else{
                    this.changeDisplayView(this.defaultSelectionDrop);
                }
            }
        
    }
    }

    activeScholars() {
        this.ActiveScholarsCount = 0;
        this.rowItemsRoaster.forEach((activeScholar: any) => {
            if (activeScholar.status && activeScholar.status.value === 'Active') {
                this.ActiveScholarsCount += 1;
            }
        })
    }

    calculateIndex(index: any) {
        let currentPage: any = this.currentPage;
        let pageCount = this.isMobileForAPiCall ? this.noOfRowsForMobile : 25
        let currentNext: any = currentPage * pageCount;
        return (currentPage == 1 ? index + 1 : ((currentNext - pageCount) + index + 1));
    }


    addScholarToTable(item: any, customFiledData: any) {
        this.scholarName = item.firstName + " " + item.lastName;
        this.step5Scholars.push(item);
        this.no_data_roaster = 'disable';
        let emergencyArray = this.setAmulatorforEmergency(item)
        let familiesArray = this.setAmulatorforFamilies(item)
        let scholarRow = {
            id: item.id,
            address: {
                id: item.address ? item.address.id : 0,
                scholarProgramSiteMappingId: item.address ? item.address.scholarProgramSiteMappingId : 0
            },
            consent: {
                id: item.consent ? item.consent.id : 0,
                scholarProgramSiteMappingId: item.consent ? item.consent.scholarProgramSiteMappingId : 0
            },
            emergencyContacts: emergencyArray,
            families: familiesArray,
            medical: {
                id: item.medical ? item.medical.id : 0,
                scholarProgramSiteMappingId: item.medical ? item.medical.scholarProgramSiteMappingId : 0
            }
        };
        this.idsAccumulator.unshift(scholarRow);
        let rowDecider: any = this.rowItemsRoaster.length == 0 ? APP_CONST.ROW_OBJ_TABLE : this.rowItemsRoaster[APP_CONST.ZERO];
        rowDecider.bellXcelId.isHidden = true;
        let newRowObj = JSON.parse(JSON.stringify({ ...rowDecider }));
        Object.keys(newRowObj).forEach((itemObj: any) => {
            newRowObj[itemObj].value = '';
        })
        let rowObjPrivate = JSON.parse(JSON.stringify({ ...newRowObj }));
        let newRowObjPrivate = JSON.parse(JSON.stringify(rowObjPrivate));
        Object.keys(item).forEach((itemKey: any) => {
            if (typeof (item[itemKey]) == 'string' || typeof (item[itemKey]) == 'number') {
                if (newRowObjPrivate.hasOwnProperty(itemKey)) {
                    if (itemKey == 'status') {
                        newRowObjPrivate[itemKey].value = item[itemKey] == 2 ? 'Inactive' : 'Active';
                    }
                    else {
                        newRowObjPrivate[itemKey].value = item[itemKey]
                    }
                }
                else {
                    let stringsMap = ['schoolStudentId', 'homePhone', 'birthday', 'externalScholarId', 'uid', 'documents'];
                    if (stringsMap.indexOf(itemKey) !== -1) {
                        stringsMap.indexOf(itemKey) == APP_CONST.ZERO && (newRowObjPrivate['studentSchoolIds'] && (newRowObjPrivate['studentSchoolIds'].value = item[itemKey]));
                        stringsMap.indexOf(itemKey) == APP_CONST.ONE && (newRowObjPrivate['home#'] && (newRowObjPrivate['home#'].value = item[itemKey]));
                        stringsMap.indexOf(itemKey) == APP_CONST.TWO && (newRowObjPrivate['birthDate'] && (newRowObjPrivate['birthDate'].value = item[itemKey]));
                        stringsMap.indexOf(itemKey) == APP_CONST.THREE && (newRowObjPrivate['scholarIds'] && (newRowObjPrivate['scholarIds'].value = item[itemKey]));
                        stringsMap.indexOf(itemKey) == APP_CONST.FOUR && (newRowObjPrivate['bellXcelId'] && (newRowObjPrivate['bellXcelId'].value = item[itemKey]));
                        stringsMap.indexOf(itemKey) == APP_CONST.FIVE && (newRowObjPrivate['documents'] && (newRowObjPrivate['documents'].value = item[itemKey]));

                    }
                }
            }
            else if (typeof (item[itemKey]) == 'object' && !Array.isArray(item[itemKey])) {
                if (itemKey == 'consent') {
                    let consentsMap = ['scholarInfoForm', 'photoOptOut', 'medicalForm', 'fieldTripForm', 'emergencyForm'];
                    Object.keys(item[itemKey]).forEach((consentKey: any) => {
                        if (consentsMap.indexOf(consentKey) !== -1) {
                            consentsMap.indexOf(consentKey) == APP_CONST.ZERO && (newRowObjPrivate['scholarInfoCF'] && (newRowObjPrivate['scholarInfoCF'].value = item[itemKey][consentKey]));
                            consentsMap.indexOf(consentKey) == APP_CONST.ONE && (newRowObjPrivate['photoVideoOptOut'] && (newRowObjPrivate['photoVideoOptOut'].value = item[itemKey][consentKey]));
                            consentsMap.indexOf(consentKey) == APP_CONST.TWO && (newRowObjPrivate['medicalCF'] && (newRowObjPrivate['medicalCF'].value = item[itemKey][consentKey]));
                            consentsMap.indexOf(consentKey) == APP_CONST.THREE && (newRowObjPrivate['fieldTripCF'] && (newRowObjPrivate['fieldTripCF'].value = item[itemKey][consentKey]));
                            consentsMap.indexOf(consentKey) == APP_CONST.FOUR && (newRowObjPrivate['emergencyCF'] && (newRowObjPrivate['emergencyCF'].value = item[itemKey][consentKey]));
                        }
                    })
                }
                else if (itemKey == 'medical') {
                    let medicalKeysMap = ['asthmaInhaler', 'ellstatus', 'iepstatus', 'medication'];
                    Object.keys(item[itemKey]).forEach((medicalKey: any) => {
                        if (medicalKeysMap.indexOf(medicalKey) !== -1) {
                            medicalKeysMap.indexOf(medicalKey) == APP_CONST.ZERO && (newRowObjPrivate['inhaler'] && (newRowObjPrivate['inhaler'].value = item[itemKey][medicalKey]));
                            medicalKeysMap.indexOf(medicalKey) == APP_CONST.ONE && (newRowObjPrivate['ellStatus'] && (newRowObjPrivate['ellStatus'].value = item[itemKey][medicalKey]));
                            medicalKeysMap.indexOf(medicalKey) == APP_CONST.TWO && (newRowObjPrivate['iepStatus'] && (newRowObjPrivate['iepStatus'].value = item[itemKey][medicalKey]));
                            medicalKeysMap.indexOf(medicalKey) == APP_CONST.THREE && (newRowObjPrivate['medications'] && (newRowObjPrivate['medications'].value = item[itemKey][medicalKey]));
                        }
                        else if (newRowObjPrivate.hasOwnProperty(medicalKey)) {
                            newRowObjPrivate[medicalKey].value = item[itemKey][medicalKey]
                        }
                    })
                }

                else if (itemKey == 'address') {
                    let addressKeysMap = ['scholarAddress1', 'scholarAddress2', 'zipCode'];
                    Object.keys(item[itemKey]).forEach((addressKey: any) => {
                        if (addressKeysMap.indexOf(addressKey) !== -1) {
                            addressKeysMap.indexOf(addressKey) == APP_CONST.ZERO && (newRowObjPrivate['address1'] && (newRowObjPrivate['address1'].value = item[itemKey][addressKey]));
                            addressKeysMap.indexOf(addressKey) == APP_CONST.ONE && (newRowObjPrivate['address2'] && (newRowObjPrivate['address2'].value = item[itemKey][addressKey]));
                            addressKeysMap.indexOf(addressKey) == APP_CONST.TWO && (newRowObjPrivate['zip'] && (newRowObjPrivate['zip'].value = item[itemKey][addressKey]));
                        }
                        else if (newRowObjPrivate.hasOwnProperty(addressKey)) {
                            newRowObjPrivate[addressKey].value = item[itemKey][addressKey]
                        }
                    })
                }


            }
            else if (Array.isArray(item[itemKey])) {
                if (itemKey == 'families') {
                    item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                        /* istanbul ignore else */
                        if (familyObjIndex <= 1) {
                            let familiesMap = ['firstName', 'lastName', 'phone', 'relationship', 'email', 'allowedToPickup'];
                            Object.keys(familyObj).forEach((familyKey: any) => {
                                if (familiesMap.indexOf(familyKey) !== -1) {
                                    familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'] && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.FOUR && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.FIVE && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'] && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'].value = item[itemKey][familyObjIndex][familyKey]));
                                }
                            })
                        }
                    })
                }
                else if (itemKey == 'emergencyContacts') {
                    item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                        /* istanbul ignore else */
                        if (familyObjIndex == 0) {
                            let familiesMap = ['firstName', 'lastName', 'phone', 'phoneOther'];
                            Object.keys(familyObj).forEach((familyKey: any) => {
                                if (familiesMap.indexOf(familyKey) !== -1) {
                                    familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate['emergencyContactFirstName'] && (newRowObjPrivate['emergencyContactFirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate['emergencyContactLastName'] && (newRowObjPrivate['emergencyContactLastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate['emergencyContactPrimaryPhone'] && (newRowObjPrivate['emergencyContactPrimaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                    familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate['emergencyContactSecondaryPhone'] && (newRowObjPrivate['emergencyContactSecondaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                }
                            })
                        }
                    })
                }
            }

        })
        if (this.rowItemsRoaster.length > 24) {
            this.rowItemsRoaster.pop();
        }
        /* istanbul ignore else */
        if (customFiledData.length > 0) {
            Object.keys(newRowObjPrivate).forEach((itemKey: any) => {
                if (newRowObjPrivate[itemKey].columnType[0] === "Custom Fields") {
                    for (var i = 0; i < customFiledData.length; i++) {
                        if (itemKey === customFiledData[i].name) {
                            newRowObjPrivate[itemKey].value = customFiledData[i].value
                        }
                    }


                }
            })
        }
        this.rowItemsRoaster.unshift(newRowObjPrivate);
        /* istanbul ignore else */
        if (newRowObjPrivate && newRowObjPrivate.status && newRowObjPrivate.status.value == 'Active') {
            this.activeCountScholars = this.activeCountScholars + APP_CONST.ONE;
        }
        this.activeScholars();
        if (this.query) {
            this.searchUsingQuery(this.query.trim());
        } else if (this.firstNameSorted || this.lastNameSorted || this.birtDaySorted) {
            this.sortRequired = true;
            this.toggleSortedColumn();
        }
        else {
            this.getDataForPage(1);
        }
        if(this.rowItemsRoaster.length > 0){
            this.step5DataAdded = true;
        }

    }

    updateOldStatus(item: any) {
        this.oldStatus = item;
    }

    updateScholarData(item: any, customFiledData: any) {
        let bellXcelId = item.uid;
        for (let i = 0; i < this.step5Scholars.length; i++) {
            if (bellXcelId == this.step5Scholars[i].uid) {
                this.step5Scholars[i] = item;
            }
        }

        let indexToUpdate = this.rowItemsRoaster.findIndex((itemRow: any) => itemRow.bellXcelId.value === item.uid);
        /* istanbul ignore else */
        if (indexToUpdate !== -1) {
            let newRowObjPrivate = this.rowItemsRoaster[indexToUpdate];
            /* istanbul ignore else */
            if (customFiledData.length > 0) {
                Object.keys(newRowObjPrivate).forEach((itemKey: any) => {
                    if (newRowObjPrivate[itemKey].columnType[0] === "Custom Fields") {
                        for (var i = 0; i < customFiledData.length; i++) {
                            if (itemKey === customFiledData[i].name) {
                                newRowObjPrivate[itemKey].value = customFiledData[i].value
                            }
                        }


                    }
                })
            }
            this.setIdAmulatorForEditScholar(item)
            Object.keys(item).forEach((itemKey: any) => {
                if (typeof (item[itemKey]) == 'string' || typeof (item[itemKey]) == 'number') {
                    if (newRowObjPrivate.hasOwnProperty(itemKey)) {
                        if (itemKey == 'status') {
                            newRowObjPrivate[itemKey].value = item[itemKey] == 2 ? 'Inactive' : 'Active';

                            if (item[itemKey] == 2 && newRowObjPrivate[itemKey].value != this.oldStatus) {
                                this.activeCountScholars = this.activeCountScholars - APP_CONST.ONE;
                            } else if (item[itemKey] == 1 && newRowObjPrivate[itemKey].value != this.oldStatus) {
                                this.activeCountScholars = this.activeCountScholars + APP_CONST.ONE;
                            }
                        }
                        else {
                            newRowObjPrivate[itemKey].value = item[itemKey]
                        }
                    }
                    else {
                        let stringsMap = ['schoolStudentId', 'homePhone', 'birthday', 'externalScholarId', 'uid', 'documents'];
                        if (stringsMap.indexOf(itemKey) !== -1) {
                            stringsMap.indexOf(itemKey) == APP_CONST.ZERO && (newRowObjPrivate['studentSchoolIds'] && (newRowObjPrivate['studentSchoolIds'].value = item[itemKey]));
                            stringsMap.indexOf(itemKey) == APP_CONST.ONE && (newRowObjPrivate['home#'] && (newRowObjPrivate['home#'].value = item[itemKey]));
                            stringsMap.indexOf(itemKey) == APP_CONST.TWO && (newRowObjPrivate['birthDate'] && (newRowObjPrivate['birthDate'].value = item[itemKey]));
                            stringsMap.indexOf(itemKey) == APP_CONST.THREE && (newRowObjPrivate['scholarIds'] && (newRowObjPrivate['scholarIds'].value = item[itemKey]));
                            stringsMap.indexOf(itemKey) == APP_CONST.FOUR && (newRowObjPrivate['bellXcelId'] && (newRowObjPrivate['bellXcelId'].value = item[itemKey]));
                            stringsMap.indexOf(itemKey) == APP_CONST.FIVE && (newRowObjPrivate['documents'] && (newRowObjPrivate['documents'].value = item[itemKey]));

                        }
                    }
                }
                else if (typeof (item[itemKey]) == 'object' && !Array.isArray(item[itemKey])) {
                    if (itemKey == 'consent') {
                        let consentsMap = ['scholarInfoForm', 'photoOptOut', 'medicalForm', 'fieldTripForm', 'emergencyForm'];
                        Object.keys(item[itemKey]).forEach((consentKey: any) => {
                            if (consentsMap.indexOf(consentKey) !== -1) {
                                consentsMap.indexOf(consentKey) == APP_CONST.ZERO && (newRowObjPrivate['scholarInfoCF'] && (newRowObjPrivate['scholarInfoCF'].value = item[itemKey][consentKey]));
                                consentsMap.indexOf(consentKey) == APP_CONST.ONE && (newRowObjPrivate['photoVideoOptOut'] && (newRowObjPrivate['photoVideoOptOut'].value = item[itemKey][consentKey]));
                                consentsMap.indexOf(consentKey) == APP_CONST.TWO && (newRowObjPrivate['medicalCF'] && (newRowObjPrivate['medicalCF'].value = item[itemKey][consentKey]));
                                consentsMap.indexOf(consentKey) == APP_CONST.THREE && (newRowObjPrivate['fieldTripCF'] && (newRowObjPrivate['fieldTripCF'].value = item[itemKey][consentKey]));
                                consentsMap.indexOf(consentKey) == APP_CONST.FOUR && (newRowObjPrivate['emergencyCF'] && (newRowObjPrivate['emergencyCF'].value = item[itemKey][consentKey]));
                            }
                        })
                    }
                    else if (itemKey == 'medical') {
                        let medicalKeysMap = ['asthmaInhaler', 'ellstatus', 'iepstatus', 'medication'];
                        Object.keys(item[itemKey]).forEach((medicalKey: any) => {
                            if (medicalKeysMap.indexOf(medicalKey) !== -1) {
                                medicalKeysMap.indexOf(medicalKey) == APP_CONST.ZERO && (newRowObjPrivate['inhaler'] && (newRowObjPrivate['inhaler'].value = item[itemKey][medicalKey]));
                                medicalKeysMap.indexOf(medicalKey) == APP_CONST.ONE && (newRowObjPrivate['ellStatus'] && (newRowObjPrivate['ellStatus'].value = item[itemKey][medicalKey]));
                                medicalKeysMap.indexOf(medicalKey) == APP_CONST.TWO && (newRowObjPrivate['iepStatus'] && (newRowObjPrivate['iepStatus'].value = item[itemKey][medicalKey]));
                                medicalKeysMap.indexOf(medicalKey) == APP_CONST.THREE && (newRowObjPrivate['medications'] && (newRowObjPrivate['medications'].value = item[itemKey][medicalKey]));
                            }
                            else if (newRowObjPrivate.hasOwnProperty(medicalKey)) {
                                newRowObjPrivate[medicalKey].value = item[itemKey][medicalKey]
                            }
                        })
                    }
                    else if (itemKey == 'address') {
                        let addressKeysMap = ['scholarAddress1', 'scholarAddress2', 'zipCode'];
                        Object.keys(item[itemKey]).forEach((addressKey: any) => {
                            if (addressKeysMap.indexOf(addressKey) !== -1) {
                                addressKeysMap.indexOf(addressKey) == APP_CONST.ZERO && (newRowObjPrivate['address1'] && (newRowObjPrivate['address1'].value = item[itemKey][addressKey]));
                                addressKeysMap.indexOf(addressKey) == APP_CONST.ONE && (newRowObjPrivate['address2'] && (newRowObjPrivate['address2'].value = item[itemKey][addressKey]));
                                addressKeysMap.indexOf(addressKey) == APP_CONST.TWO && (newRowObjPrivate['zip'] && (newRowObjPrivate['zip'].value = item[itemKey][addressKey]));
                            }
                            else if (newRowObjPrivate.hasOwnProperty(addressKey)) {
                                newRowObjPrivate[addressKey].value = item[itemKey][addressKey]
                            }
                        })
                    }


                }
                else if (Array.isArray(item[itemKey])) {
                    /* istanbul ignore else */
                    if (itemKey == 'families') {
                        item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                            if (familyObjIndex <= 1) {
                                let familiesMap = ['firstName', 'lastName', 'phone', 'relationship', 'email', 'allowedToPickup'];
                                Object.keys(familyObj).forEach((familyKey: any) => {
                                    if (familiesMap.indexOf(familyKey) !== -1) {
                                        familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1FirstName' : 'familyContact#2FirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1LastName' : 'familyContact#2LastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Phone' : 'familyContact#2Phone'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'] && (newRowObjPrivate[familyObjIndex == 0 ? 'relationship' : 'familyContact#2Relationship'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.FOUR && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'] && (newRowObjPrivate[familyObjIndex == 0 ? 'familyContact#1Email' : 'familyContact#2Email'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.FIVE && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'] && (newRowObjPrivate[familyObjIndex == 0 ? 'allowedToPickUp' : 'familyContact#2AllowedToPickUp'].value = item[itemKey][familyObjIndex][familyKey]));
                                    }
                                })
                            }
                        })
                    }
                    else if (itemKey == 'emergencyContacts') {
                        item[itemKey].forEach((familyObj: any, familyObjIndex: number) => {
                            /* istanbul ignore else */
                            if (familyObjIndex == 0) {
                                let familiesMap = ['firstName', 'lastName', 'phone', 'phoneOther'];
                                Object.keys(familyObj).forEach((familyKey: any) => {
                                    if (familiesMap.indexOf(familyKey) !== -1) {
                                        familiesMap.indexOf(familyKey) == APP_CONST.ZERO && (newRowObjPrivate['emergencyContactFirstName'] && (newRowObjPrivate['emergencyContactFirstName'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.ONE && (newRowObjPrivate['emergencyContactLastName'] && (newRowObjPrivate['emergencyContactLastName'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.TWO && (newRowObjPrivate['emergencyContactPrimaryPhone'] && (newRowObjPrivate['emergencyContactPrimaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                        familiesMap.indexOf(familyKey) == APP_CONST.THREE && (newRowObjPrivate['emergencyContactSecondaryPhone'] && (newRowObjPrivate['emergencyContactSecondaryPhone'].value = item[itemKey][familyObjIndex][familyKey]));
                                    }
                                })
                            }
                        })
                    }
                }

            })
        }
        this.activeScholars();
    }

    rowIdUpdater(item: any) {
        let foundIndex: number = this.idsAccumulator.findIndex((accumulateItem: any) => accumulateItem.id == item.rowIds.id);
        /* istanbul ignore else */
        if (foundIndex !== -1) {
            if (item.key == 'families') {
                if (item.spliceId == 0) {
                    this.rowItemsRoaster[foundIndex]['familyContact#1FirstName'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#1LastName'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#1Phone'].value = '';
                    this.rowItemsRoaster[foundIndex]['relationship'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#1Email'].value = '';
                    this.rowItemsRoaster[foundIndex]['allowedToPickUp'].value = '';
                }
                else if (item.spliceId == 1) {
                    this.rowItemsRoaster[foundIndex]['familyContact#2FirstName'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#2LastName'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#2Phone'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#2Relationship'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#2Email'].value = '';
                    this.rowItemsRoaster[foundIndex]['familyContact#2AllowedToPickUp'].value = '';
                }
            }
            if (item.key == 'emergencyContacts') {
                /* istanbul ignore else */
                if (item.spliceId == 0) {
                    this.rowItemsRoaster[foundIndex]['emergencyContactFirstName'].value = '';
                    this.rowItemsRoaster[foundIndex]['emergencyContactLastName'].value = '';
                    this.rowItemsRoaster[foundIndex]['emergencyContactPrimaryPhone'].value = '';
                }
            }
            this.idsAccumulator[foundIndex] = item.rowIds;
        }

    }

    @Watch('componentName')
    checkComponentChange() {
        if (this.componentName === 'step5') {
            this.callAutoSaveTable([], false);
        }
    }

    callHover(keyValue1: string, event: any, keyValue2?: string) {
        let singleCell: any = this.$refs[keyValue1];
        /* istanbul ignore else */
        if (singleCell && singleCell[0].innerText.length > 17) {
            const boundBox = event.target.getBoundingClientRect();
            const coordX = boundBox.left;
            const coordY = boundBox.top;
            this.hoverStyleObj = {
                top: (coordY + 110).toString() + "px",
                left: (coordX + 80).toString() + "px"
            }
            if (keyValue1 && keyValue2) {
                this.currentHoveredCell = keyValue1 + " " + keyValue2;
            }
            else {
                this.currentHoveredCell = keyValue1;
            }
            this.hovering = keyValue1;
            this.hoveredCellValue = singleCell[0].innerText;
        }

    }

    callHoverOut() {
        this.currentHoveredCell = '';
        this.hovering = '';
        this.hoveredCellValue = '';
    }

    sortColumns(keySort: string) {
        this.rowItemsRoaster.sort(function (rowOne: any, rowTwo: any) {
            /* istanbul ignore else */
            if (keySort === 'birthDate') {
                let secondDate: any = new Date(rowTwo[keySort].value);
                let firstDate: any = new Date(rowOne[keySort].value);
                return (firstDate - secondDate);
            }
            else {
                if (rowOne[keySort].value > rowTwo[keySort].value) {
                    if (keySort.includes('custom')) {
                        return -1
                    }
                    else {
                        return 1;
                    }
                }
                else {
                    if (keySort.includes('custom')) {
                        return ((rowTwo[keySort].value > rowOne[keySort].value) ? 1 : 0)
                    }
                    else {
                        return ((rowTwo[keySort].value > rowOne[keySort].value) ? -1 : 0);
                    }

                }
            }

        });
    }


    generateNewSortIndex(sortIndex: number) {
        let sortedColumnsCustomIndex: any = [];
        let lastIndexCheck = this.sortedColumns.length - 1;
        this.sortedColumns.forEach((item: any, itemIndex: number) => {
            if ((itemIndex >= 3) && itemIndex <= lastIndexCheck) {
                sortedColumnsCustomIndex.push(itemIndex);
            }
        });
        let newSortIndex = 0;
        if (this.customIndexes.indexOf(sortIndex) !== -1) {
            this.customIndexes.forEach((customIndex: number, index: number) => {
                if (sortIndex === customIndex) {
                    newSortIndex = sortedColumnsCustomIndex[index];
                }
            })
            return newSortIndex;
        }
        else {
            return sortIndex;
        }

    }

    sortedColumnsCheck(sortedColIndex: number, sortIndex: number) {

    }

    openDropdown(close?: boolean) {
        this.openDropStatus = this.openDropStatus ? APP_CONST.FALSE : (close ? APP_CONST.FALSE : APP_CONST.TRUE);
    }

    closeDropdown() {
        this.openDropStatus = false;
    }


    changeDisplayView(columnType: string) {
        setTimeout(()=>{
            var element: any = document.getElementById('table-row') ? document.getElementById('table-row') : {offsetWidth: ""};
            var elmScroller:any = document.getElementById('table-scroll') ? document.getElementById('table-scroll') : {style: {width: ""}};
            var scrollerView:any = document.getElementById('table-scroll-wrapper') ? document.getElementById('table-scroll-wrapper') : {style: {width: ""}};
            elmScroller.style.width=element.offsetWidth+'px';
            scrollerView.style.width=element.offsetWidth+'px';
          },100)
        this.rowItemsRoaster.forEach((rowItem: any, rowIndex: number) => {
            Object.keys(rowItem).forEach((rowKey: any, rowKeyIndex: number) => {
                if ((rowItem[rowKey].columnType.indexOf(columnType) !== -1) || (rowItem[rowKey].columnType.indexOf('Global') !== -1)) {
                    rowItem[rowKey].isHidden = false;
                    if (this.componentName == 'step5' || this.componentName == 'error_screen') {
                        if (rowKey == 'bellXcelId') {
                            rowItem[rowKey].isHidden = true;
                        }
                    }
                }
                else if (columnType === 'All Columns') {
                    rowItem[rowKey].isHidden = false;
                    if (this.componentName == 'step5' || this.componentName == 'error_screen') {
                        if (rowKey == 'bellXcelId' || rowKey == 'documents' || (this.componentName == 'error_screen' && rowKey == 'scheduledDays')) {
                            rowItem[rowKey].isHidden = true
                        }
                    }
                }
                else {
                    rowItem[rowKey].isHidden = true;
                }
            })
        })
        this.columnsRoaster.forEach((colItem: any, colIndex: number) => {
            if ((colItem.columnType.indexOf(columnType) !== -1) || (colItem.columnType.indexOf('Global') !== -1)) {
                colItem.isHidden = false;
            }
            else if (columnType === 'All Columns' && colItem.columnName == "scheduledDays" && (this.componentName == 'error_screen' || this.componentName == 'repair-table')) {
                colItem.isHidden = true;
            }
            else if (columnType === 'All Columns' && colItem.columnName != "documents") {
                colItem.isHidden = false;
            }
            else if (columnType === 'All Columns' && colItem.columnName == "documents") {
                colItem.isHidden = true;
            }
            else {
                colItem.isHidden = true;
            }
        })
        if (this.mobileView && this.defaultSelectionDrop != columnType) { this.closeSearchPopup() }
        this.defaultSelectionDrop = columnType;
        this.openDropStatus = false;


    }

    toggleSort(header: any, sortIndex: number) {
        if((header && header.columnType && header.columnType[0]) && (header.columnType[0]=='Family' || header.columnType[0]=='Emergency')){
            return
        }
        this.lastSortedHeader = header;
        this.lastSortedIndex = sortIndex;
        this.changeDisplayView(this.defaultSelectionDrop);
        if (!this.sortRequired) {
            this.sortDir = this.sortDir == 1 ? 2 : 1;
        }
        let componentName = this.componentName;
        let stepNumber = componentName == 'repair-table' ? 3 : componentName == 'error_screen' ? 4 : 5;
        let sortName = (stepNumber == 4 || stepNumber == 5) ? header.columnType.includes("Custom Fields") ? this.checkCustomcolumn(header.columnIndex, 'filter') : header.columnName : this.checkStep3Values(header.columnTitle)
        let siteId = this.userDetails.siteId ? this.userDetails.siteId : 0;
        let stepObj = {
            siteId,
            stepNumber,
            id: 0,
            active: 0,
            search: this.isSearching && this.query.length > 2 ? this.query : '',
            page: this.currentPage,
            count: this.isMobileForAPiCall ? this.noOfRowsForMobile : 25,
            sortField: sortName,
            sortDir: this.sortDir
        }
        if (header.hasOwnProperty('order')) {
            this.columnsRoaster.forEach((item: { columnName: string, columnTitle: string, order: number }) => {
                if (item.columnTitle == header.columnTitle) {
                    item.order = header.order === 1 ? 2 : 1;
                    this.sortFieldTitle = item.columnTitle;
                    this.sortField = (stepNumber == 4 || stepNumber == 5) ? header.columnType.includes("Custom Fields") ? this.checkCustomcolumn(header.columnIndex, 'filter') : header.columnName : this.checkStep3Values(header.columnTitle);
                    this.order = item.order;
                } else {
                    if (item.order) {
                        item.order = 0;
                    }
                }
            })
            stepObj.sortDir = this.order;
        }
        if (stepNumber == 5) {
            stepObj.page = this.currentPage;
            this.callStep5Table(stepObj);
            this.setSortingDefault(header.columnIndex)
        } else {
            this.setSortingDefault(header.columnIndex)
            this.getTableData(stepObj, 'toggle');
        }

    }
    checkCustomcolumn(index: any, type: string) {
        let filterValue = ["CustomValue1", "CustomValue2", "CustomValue3", "CustomValue4", "CustomValue5"]
        if (type == 'filter') {
            return filterValue[index]
        } else {
            let createKey = this.authKey + "_roster_sort";
            let sortVal: string | null = "";
            if (APP_UTILITIES.getSortingOnSession(createKey)) {
                sortVal = APP_UTILITIES.getSortingOnSession(createKey);
                let sortObj: { key: string, dir: string, customColumn: string } = sortVal ? JSON.parse(sortVal) : {};

                return sortObj.key == index
            }
        }
    }
    checkStep3Values(key: string) {
        let values = [{ key: "Birth Date", value: "Birthday" }, { key: "School Student ID", value: "School Student ID" }, { key: "Scholar ID", value: "Scholar ID" }, { key: "Group", value: "Group" }, { key: "Address 1", value: "Address 1" }, { key: "Address 2", value: "Address 2" }, { key: 'Inhaler', value: 'Asthma Inhaler' }, { key: 'Home #', value: 'Home Phone' }, { key: 'Scholar Info Consent', value: 'Scholar Information Consent Form' }, { key: 'Field Trip Consent', value: 'Field Trip Consent Form' }, { key: 'Emergency Consent', value: 'Emergency Consent Form' }, { key: 'Medical Consent', value: 'Medical Consent Form' }]
        let findValue = values.filter(obj => obj.key == key)
        if (findValue.length > 0) {
            return findValue[0].value
        }
        return key
    }
    scroll(event: any, type: string) {
        /* istanbul ignore else */
        if (type === 'table') {
            /* istanbul ignore else */
            if (event.target.scrollLeft > 2.5) {
                this.dynamicScrollableClass = 'scroll-set'
            }
            else {
                this.dynamicScrollableClass = ''
            }
        }
    }

    removeDuplicates(data: any) {
        return data.filter((value: number, index: number) => data.indexOf(value) === index);
    }

    navStep() {
        if (this.componentName === 'repair-table') {
            this.goPage = '';
            this.currentPage = 1;
            this.navStepper(APP_CONST.SCHOLAR_STEPPER[1]);
        }
        else if (this.componentName === 'error_screen') {
            this.goPage = '';
            this.currentPage = 1;
           // this.navStepper(APP_CONST.SCHOLAR_STEPPER[2]);
        }
    }

    reupload() {
        this.$router.push('/roster/new');
    }

    @Watch('query', { deep: true })
    changeInSearchQuery(val: string, oldVal: string) {
        if(val.length < 3){
            this.isSearching = false;
            if (val.length == 0) {
                this.searchNoContentCase = false;
                this.searchUsingQuery(val.trim());
            }
        }
    }

    searchUsingQuery(searchValue: string) {
        let componentName = this.componentName;
        let stepNumber = componentName == 'repair-table' ? 3 : componentName == 'error_screen' ? 4 : 5;
        let sortNames = (stepNumber == 4 || stepNumber == 5) ? this.lastSortedHeader.columnType.includes("Custom Fields") ? this.checkCustomcolumn(this.lastSortedHeader.columnIndex, 'filter') : this.lastSortedHeader.columnName : this.checkStep3Values(this.lastSortedHeader.columnTitle)
        let siteId = this.userDetails.siteId ? this.userDetails.siteId : 414;

        let stepObj = {
            siteId,
            stepNumber: stepNumber == 4 ? stepNumber - 1 : stepNumber,
            id: 0,
            active: 0,
            search: searchValue,
            page: 1,
            count: this.isMobileForAPiCall ? this.noOfRowsForMobile : 25,
            sortDir: this.sortDir,
            sortField: sortNames
        }
        if (stepNumber == 4) {
            stepObj.stepNumber = 4;
            this.callStep5Table(stepObj)
        }
        else if (stepNumber == 5) {
            stepObj.stepNumber = 5;
            this.currentPage = 1;
            this.pageMove = {
                isPageChange: true,
                pageIndex: 1,
                pageChange: true
            }
            this.handleSortingIcon()
            this.callStep5Table(stepObj)
        }
        else {
            this.getTableData(stepObj);
        }
    }

    handleSortingIcon() {
        if (this.lastSortedIndex == 0) {
            this.firstNameSorted = false;
            this.lastNameSorted = true;
            this.birtDaySorted = false;
        } else if (this.lastSortedIndex == 1) {
            this.firstNameSorted = true;
            this.lastNameSorted = false;
            this.birtDaySorted = false;
        } else if (this.lastSortedIndex == 2) {
            this.birtDaySorted = true;
            this.firstNameSorted = false;
            this.lastNameSorted = false;
        }
    }
    closeQuery() {
        this.mobileQuery = ''
        this.query = '';
        this.isSearching = false;
        this.isShowCrossIcon = false;
        this.mobileQuery = ''
        this.isSearchFocused = false
    }

    checkForfocusOut() {
        this.isSearchFocused = false;
    }

    checkEnterSearch(event: any) {
        this.isSearchFocused = true;
        if (this.mobileView) {
            this.query = this.mobileQuery
            this.closeSearchPopup()
        }
        if (event.key === "Enter") {
            if (this.query.length >= 3) {
                this.isSearching = true;
                this.isShowCrossIcon = true;
                this.searchUsingQuery(this.query.toLowerCase().trim());
            }
            else if (this.query.length < 3) {
                this.isShowCrossIcon = false;
            }
        }
    }

    checkCellPos(rowIndex: number, colIndex: number) {
        let newPosString = `${rowIndex}:${colIndex}`;
        /* istanbul ignore else */
        if (this.currentDblClickedCell !== newPosString) {
            this.removeDblClickedCell();
        }
        let checkClickOutIssue = this.issuesContainer.findIndex((issue: any) => issue.referenceCell === this.singleClickedCell);
        let checkClickInIssue = this.issuesContainer.findIndex((issue: any) => issue.referenceCell === newPosString);
        /* istanbul ignore else */
        if (this.singleClickedCell !== newPosString) {
            if ((this.singleClickedCell.length > APP_CONST.ZERO) && (checkClickOutIssue === -1)) {
                let previousElement = this.$refs[this.singleClickedCell] as any;
                previousElement[APP_CONST.ZERO].style.border = 'none';
            }
            /* istanbul ignore else */
            if (checkClickInIssue === -1) {
                let newElement = this.$refs[newPosString] as any;
                newElement[APP_CONST.ZERO].style.border = 'none';
                newElement[APP_CONST.ZERO].style.borderTop = '2px solid #ffb733';
                newElement[APP_CONST.ZERO].style.borderLeft = '2px solid #ffb733';
                newElement[APP_CONST.ZERO].style.borderRight = '2px solid #ffb733';
                newElement[APP_CONST.ZERO].style.borderBottom = '2px solid #ffb733';
            }
        }
        this.singleClickedCell = newPosString;
    }
    makeCellEditable(rowIndex: number, colIndex: string, rowItemColumn: any) {
        let tableRef = this.$refs.repairTable as any;
        if (colIndex.includes('lastName') || colIndex.includes('fiirstName')) {
            tableRef && (tableRef.scrollLeft = 0);
        }

        if (colIndex.includes('birthDate') || colIndex.includes('inactiveDate') || colIndex.includes('enrollmentDate') || colIndex.includes('siteStartDate') || colIndex.includes('siteEndDate')) {
            this.dateValue = ''
            /* istanbul ignore else */
            if (rowItemColumn.value.length > 0) {
                this.dateValue = APP_UTILITIES.formatFullYearDate(new Date(rowItemColumn.value).toString())
            }

        } else {
            this.dateValue = rowItemColumn.value
        }
        this.today = colIndex.includes('birthDate') ? APP_UTILITIES.formatFullYearDate(new Date().toString()) : "";
        this.currentDblClickedCell = `${rowIndex}:${colIndex}`;
        let sortIndex = this.columnsRoaster.findIndex(o => o.columnName === colIndex);
        let sortColIndexUpdate = this.generateNewSortIndex(sortIndex);
        this.sortedColumns[sortColIndexUpdate] = false;
        if (colIndex.includes('status')) {
            this.oldValue = rowItemColumn.value
        }

    }
    checkRow(colIndex: any) {
        if (colIndex.includes('birthDate') || colIndex.includes('inactiveDate') || colIndex.includes('enrollmentDate') || colIndex.includes('siteStartDate') || colIndex.includes('siteEndDate')) {
            return true
        } else {
            return false
        }
    }
    removeDblClickedCell() {
        this.currentDblClickedCell = ''
    }
    updateDateIssuesBlur(value: any) {
        this.dateValue = value
        if (this.phoneNumberFields.indexOf(this.currentDblClickedCell.split(':')[1]) !== -1) {
            let valueToChangeRef = this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value;
            this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value = this.generateFormattedNumber(valueToChangeRef);
        }
        this.changeDate(this.currentDblClickedCell, value);
        this.populateIssueToResolve();

        this.checkRevisonsMade('blurAutoSave');
    }
    updateIssuesBlur(value: any) {
        this.dateValue = value;
        this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value = value;
        if (this.phoneNumberFields.indexOf(this.currentDblClickedCell.split(':')[1]) !== -1) {
            let valueToChangeRef = this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value;
            this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value = this.generateFormattedNumber(valueToChangeRef);
        }

        this.populateIssueToResolve();

        this.changeDate(this.currentDblClickedCell, value);
        this.checkRevisonsMade('blurAutoSave');
        if (value.toLowerCase() === APP_CONST.ACTIVE.toLowerCase() || value.toLowerCase() === APP_CONST.INACTIVE.toLowerCase()) {
            let newValue = this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value;
            if ((value.toLowerCase() === APP_CONST.ACTIVE.toLowerCase()) && (newValue.toLowerCase() != this.oldValue.toLowerCase())) {
                this.activeCountScholars = this.activeCountScholars + APP_CONST.ONE;
            }
            else if ((value.toLowerCase() === APP_CONST.INACTIVE.toLowerCase()) && (newValue != this.oldValue)) {
                this.activeCountScholars = this.activeCountScholars - APP_CONST.ONE;
            }
        } else{
            this.rowItemsRoaster[parseInt(this.currentDblClickedCell.split(':')[0])][this.currentDblClickedCell.split(':')[1]].value = value;
        }
        this.activeCountScholars = (this.activeCountScholars < APP_CONST.ZERO) ? APP_CONST.ZERO : this.activeCountScholars;
    }

    populateIssueToResolve(stringParam: string = '') {
        let beforeIssues: any = JSON.parse(JSON.stringify(this.issuesContainer));
        let beforePopActiveIndex = this.issuesContainer.findIndex((item: any) => item.currentActiveIndex === true);
        let beforePopLength = this.issuesContainer && this.issuesContainer.length;
        let beforeActiveIssue = this.issuesContainer[beforePopActiveIndex];
        this.beforeActiveIssueObj = beforeActiveIssue;
        this.issuesContainer = [];
        let count = 0;
        let requiredColumns = APP_CONST.REQUIRED_COLUMNS;
        this.rowItemsRoaster.forEach((rowObj: any, indexRow: number) => {
            Object.keys(rowObj).forEach((rowKey: any, rowKeyIndex: any) => {
                if (requiredColumns.indexOf(rowKey) !== -1) {
                    if (rowObj[rowKey].value.length === 0) {
                        rowObj[rowKey].issueType = 'emptyField';
                        this.issuesContainer.push({
                            issueType: 'emptyField',
                            referenceCell: `${indexRow}:${rowKey}`,
                            currentActiveIndex: false,
                            rowId: indexRow + 1,
                            count: 0,
                            isRequired: requiredColumns.findIndex((item) => item === rowKey) !== -1 ? true : false
                        });
                    }
                    else if ((this.phoneNumberFields.indexOf(rowKey) !== -1) && (rowObj[rowKey].value.replace(/-|\s/g, "").length < 10 || rowObj[rowKey].value.replace(/-|\s/g, "").length > 10)) {
                        rowObj[rowKey].issueType = 'phoneNumberInvalid';
                        this.issuesContainer.push({
                            issueType: 'phoneNumberInvalid',
                            referenceCell: `${indexRow}:${rowKey}`,
                            currentActiveIndex: false,
                            rowId: indexRow + 1,
                            count: 0,
                            isRequired: requiredColumns.findIndex((item) => item === rowKey) !== -1 ? true : false
                        });
                    }
                    else if ((this.emailFields.indexOf(rowKey) !== -1) && (!this.emailCheck.test(rowObj[rowKey].value)) && (!rowObj[rowKey].value.endsWith('.com') || !rowObj[rowKey].value.endsWith('.org') || !rowObj[rowKey].value.endsWith('.net'))) {
                        rowObj[rowKey].issueType = 'emailInvalid';
                        this.issuesContainer.push({
                            issueType: 'emailInvalid',
                            referenceCell: `${indexRow}:${rowKey}`,
                            currentActiveIndex: false,
                            rowId: indexRow + 1,
                            count: 0,
                            isRequired: requiredColumns.findIndex((item) => item === rowKey) !== -1 ? true : false
                        });
                    }
                    else {
                        rowObj[rowKey].issueType = '';
                        let issueGet = this.issuesContainer.findIndex((issueObj) => issueObj.referenceCell === `${indexRow}:${rowKey}`);
                        if (typeof (issueGet) === 'number' && issueGet !== -1) {
                            this.issuesContainer.splice(issueGet, 1);
                        }

                    }
                }
            })
        })
        let afterPopLength = this.issuesContainer.length;
        this.issuesContainer.length > 0 && this.issuesContainer.forEach((issueObj: any, issueIndex: number) => {
            issueObj.count = count + 1;
            if (issueIndex === beforePopActiveIndex) {
                issueObj.currentActiveIndex = true;
            }
            if (afterPopLength < beforePopLength && issueIndex === 0 && ((beforePopLength - 1) === beforePopActiveIndex)) {
                issueObj.currentActiveIndex = true;
            }
            if (beforePopActiveIndex === -1 && issueIndex === 0) {
                issueObj.currentActiveIndex = true;
            }
        })
        if (stringParam.length > 0) {
            this.issuesContainer.length > 0 && (this.issuesContainer[APP_CONST.ZERO].currentActiveIndex = true);
        }
        let checkActiveIndex = this.issuesContainer.findIndex((item: any) => item.currentActiveIndex === true);
        /* istanbul ignore else */
        if (checkActiveIndex !== -1) {
            this.issuesContainer.forEach((issueStyleObj: any, issueObjIndex: number) => {
                if (checkActiveIndex === issueObjIndex && issueStyleObj.issueType === "emptyField") {
                    let currentCell = this.$refs[issueStyleObj.referenceCell] as any;
                    /* istanbul ignore else */
                    if (currentCell) {
                        currentCell[0].style.border = 'none';
                        currentCell[0].style.borderTop = '3px solid #ffb733';
                        currentCell[0].style.borderLeft = '2px solid #ffb733';
                        currentCell[0].style.borderRight = '2px solid #ffb733';
                        currentCell[0].style.borderBottom = '2px solid #ffb733';
                    }
                }
                else {
                    let otherCell = this.$refs[issueStyleObj.referenceCell] as any;
                    otherCell && (otherCell[0].style.border = '1px solid #c5c5c5');
                }
            })
        }
        else {
            this.issuesContainer.forEach((issueStyleObj: any, issueObjIndex: number) => {
                if (issueObjIndex === 0) {
                    let currentCell = this.$refs[issueStyleObj.referenceCell] as any;
                    if (currentCell) {
                        currentCell[0].style.border = 'none';
                        currentCell[0].style.borderTop = '3px solid #ffb733';
                        currentCell[0].style.borderLeft = '2px solid #ffb733';
                        currentCell[0].style.borderRight = '2px solid #ffb733';
                        currentCell[0].style.borderBottom = '2px solid #ffb733';
                    }

                }
                else {
                    let otherCell = this.$refs[issueStyleObj.referenceCell] as any;
                    otherCell && (otherCell[0].style.border = '1px solid #c5c5c5');
                }
            })
        }

        let rowCheck: any = [];
        this.rowItemsRoaster.forEach((rowObj: any, rowObjIndex: number) => {
            let issueCount = 0;
            let emptyRowCheck = {
                rowIndex: 0,
                emptyCount: 0
            }
            this.issuesContainer.forEach((issueObj: any) => {
                if (rowObjIndex === parseInt(issueObj.referenceCell.split(':')[0])) {
                    issueCount++
                }
            });
            emptyRowCheck.rowIndex = rowObjIndex;
            emptyRowCheck.emptyCount = issueCount;
            rowCheck.push(emptyRowCheck);
        });
        this.rowCheckEmpty = rowCheck;
        let splicedNew: any = [];
        if (beforeIssues.length > this.issuesContainer.length) {
            beforeIssues.forEach((item: any) => {
                if (this.issuesContainer.findIndex((itemNew: any) => itemNew.rowID == item.rowId) == -1) {
                    splicedNew.push(item);
                }
            });
            let indexFinder: any = this.unresolvedStep3Validations.findIndex((item: any) => item.pageNumber == this.currentPage);
            indexFinder !== -1 && (this.unresolvedStep3Validations.splice(indexFinder, 1))
        }
        if (beforeIssues.length < this.issuesContainer.length) {
            let lastIssueIndex: number = this.issuesContainer.length - 1;
            let lastIssueAdded: any = this.issuesContainer[lastIssueIndex];
            /* istanbul ignore else */
            if (APP_CONST.REQUIRED_COLUMNS.indexOf(lastIssueAdded.referenceCell.split(':')[1]) !== -1) {
                let validationObj: any = {
                    cellId: 2,
                    isValid: false,
                    pageNumber: this.currentPage,
                    rowId: lastIssueAdded.rowId,
                    validatorType: "Mandatory"
                }
                stringParam !== 'createTime' && (this.unresolvedStep3Validations.push(validationObj));
            }
        }
        let unresolvedIndex: any = this.unresolvedStep3Validations.findIndex((item: any) => item.rowId == (splicedNew.length && splicedNew[0].rowId));
        unresolvedIndex !== -1 && (this.unresolvedStep3Validations.splice(unresolvedIndex, 1));
        if (splicedNew[0] && typeof (splicedNew[0]) == 'object' && this.issuesContainer.length == 0 && (beforeIssues.length - this.issuesContainer.length) == 1) {
            let pageToMove: any = this.unresolvedStep3Validations.length > 0 ? this.unresolvedStep3Validations[0].pageNumber : this.currentPage + 1;
            let pageCount = this.isMobileForAPiCall ? this.noOfRowsForMobile : 25
            if (Math.trunc(this.scholarsSearchCount  / pageCount) > this.currentPage) {
                this.pageMove = {
                    isPageChange: true,
                    pageIndex: pageToMove
                }
            }
        }
        else {
            this.pageMove = {
                isPageChange: false,
                pageIndex: 0
            }
        }
    }

    updateIssueContainerNext() {
        this.issuesContainer.forEach((issueStyleObj: any, issueObjIndex: number) => {
            if (issueStyleObj.currentActiveIndex === true) {
                let currentCell = this.$refs[issueStyleObj.referenceCell] as any;
                currentCell[0].style.border = 'none';
                currentCell[0].style.borderTop = '3px solid #ffb733';
                currentCell[0].style.borderLeft = '2px solid #ffb733';
                currentCell[0].style.borderRight = '2px solid #ffb733';
                currentCell[0].style.borderBottom = '2px solid #ffb733';
                let tableRef = this.$refs.repairTable as any;
                if (currentCell[0].offsetLeft > 904 && !issueStyleObj.referenceCell.includes('lastName') && !issueStyleObj.referenceCell.includes('firstName')) {
                    let scrollPos = currentCell[0].offsetLeft - 450;
                    tableRef && (tableRef.scrollLeft = scrollPos);
                }
                else {
                    tableRef && (tableRef.scrollLeft = 0);
                }
                if (currentCell[0].offsetTop > 373) {
                    tableRef.scrollTop = currentCell[0].offsetTop;
                }
                else {
                    tableRef.scrollTop = 0;
                }
            }
            else {
                let otherCell = this.$refs[issueStyleObj.referenceCell] as any;
                otherCell[0].style.border = '1px solid #c5c5c5';
            }
        })

        let previousIssueCell = this.beforeActiveIssueObj && this.$refs[this.beforeActiveIssueObj.referenceCell] as any;
        previousIssueCell && previousIssueCell[0] && (previousIssueCell[0].innerText) && (previousIssueCell[0].innerText.length > 0) && (previousIssueCell[0].style.border = '0');

    }

    openSkipPopup(arrowClickedType: string) {
        if (arrowClickedType === 'next') {
            let previousIssueIndex = this.issuesContainer.findIndex((newIssueObj: any) => newIssueObj.currentActiveIndex === true);
            this.issuesContainer[previousIssueIndex].currentActiveIndex = false;
            /* istanbul ignore else */
            if (previousIssueIndex <= this.issuesContainer.length - 2) {
                this.issuesContainer[previousIssueIndex + 1].currentActiveIndex = true;
                this.issuesContainer[previousIssueIndex + 1].count = 2;
            }
            else {
                this.issuesContainer[0].currentActiveIndex = true;
                this.issuesContainer[0].count = 2;
            }
            this.updateIssueContainerNext();
            this.skipPopupDisplay = false;
        }
        if (arrowClickedType === 'previous') {
            let previousIssueIndex = this.issuesContainer.findIndex((newIssueObj: any) => newIssueObj.currentActiveIndex === true);
            this.issuesContainer[previousIssueIndex].currentActiveIndex = false;
            /* istanbul ignore else */
            if (previousIssueIndex <= this.issuesContainer.length - 1) {
                /* istanbul ignore else */
                if ((previousIssueIndex - 1) !== -1) {
                    this.issuesContainer[previousIssueIndex - 1].currentActiveIndex = true;
                    this.issuesContainer[previousIssueIndex - 1].count = 2;
                }
            }
            else {
                this.issuesContainer[0].currentActiveIndex = false;
                this.issuesContainer[0].count = 2;
            }
            this.updateIssueContainerNext();
            this.skipPopupDisplay = false;
        }

    }

    requiredPopDisplay() {
        this.requiredPopupDisplay = false;
    }

    nextIssue() {
        let previousIssueIndex = this.issuesContainer.findIndex((newIssueObj: any) => newIssueObj.currentActiveIndex === true);
        /* istanbul ignore else */
        if (previousIssueIndex !== -1) {
            /* istanbul ignore else */
            if (this.issuesContainer[previousIssueIndex].isRequired === true) {
                this.requiredPopupDisplay = true
            }
            else {
                this.skipPopupDisplay = true;
            }
        }

        this.arrowIssueClicked = 'next';
    }

    prevIssue() {
        let previousIssueIndex = this.issuesContainer.findIndex((newIssueObj: any) => newIssueObj.currentActiveIndex === true);
        /* istanbul ignore else */
        if (previousIssueIndex !== -1) {
            /* istanbul ignore else */
            if (previousIssueIndex !== 0) {
                if (this.issuesContainer[previousIssueIndex].isRequired === true) {
                    this.requiredPopupDisplay = true;
                }
                else {
                    this.skipPopupDisplay = true;
                }
            }
        }
        this.arrowIssueClicked = 'previous';
    }

    changeDate(refernceCell: string, dateValue: string) {
        if (refernceCell.includes('birthDate') || refernceCell.includes('inactiveDate') || refernceCell.includes('enrollmentDate') || refernceCell.includes('siteStartDate') || refernceCell.includes('siteEndDate')) {
            /* istanbul ignore else */
            if (dateValue.length > 0) {
                this.rowItemsRoaster.forEach((item: any, itemIndex: number) => {
                    Object.keys(item).forEach((itemkey: string, itemKeyIndex: number) => {
                        let referenceEachCell = `${itemIndex}:${itemkey}`;
                        if (referenceEachCell === refernceCell) {
                            item[itemkey].value = this.generateFormattedDate(dateValue);
                            this.dateValue = item[itemkey].value;
                        }
                    })
                })
            }

        }

    }

    generateFormattedDate(dateValue: string) {
        let newDateValue = dateValue.split("-").length == 1 ? dateValue.split('/') : dateValue.split("-");
        let d, dt, mn, monthCheck, dateCheck, yy;
        if (newDateValue.length > 1) {
            d = new Date(dateValue);
            dt = d.getDate();
            mn = d.getMonth();
            mn++;
            monthCheck = JSON.stringify(mn).length === 1 ? true : false;
            dateCheck = JSON.stringify(dt).length === 1 ? true : false;
            yy = d.getFullYear();
            return (`${yy}-${monthCheck ? '0' : ''}${mn}-${dateCheck ? '0' : ''}${dt}`);
        }
        return '';
    }

    generateFormattedNumber(numberString: any) {
        if (numberString) {
            return numberString.replace(/\D+/g, "").replace(/([0-9]{1,3})([0-9]{3})([0-9]{4}$)/gi, "$1-$2-$3");
        } else {
            return "";
        }
    }

    autoformatPhoneNumberDate() {
        let phoneNumberFields = this.phoneNumberFields;
        let dateFields = this.dateFields;
        this.rowItemsRoaster.forEach((rowObj: any, rowObjIndex: number) => {
            Object.keys(rowObj).forEach((ObjKey: string, ObjKeyIndex: number) => {
                if (dateFields.indexOf(ObjKey) !== -1) {
                    rowObj[ObjKey].value = this.generateFormattedDate(rowObj[ObjKey].value).includes('NaN') ? this.generateFormattedDate(rowObj[ObjKey].value.replace(/\-/g, '/')) : this.generateFormattedDate(rowObj[ObjKey].value);
                }
                if (phoneNumberFields.indexOf(ObjKey) !== -1) {
                    rowObj[ObjKey].value = this.generateFormattedNumber(rowObj[ObjKey].value);
                }
            })
        })
    }

    handleScrollBehaviour() {
        this.callHoverOut()
        if (window.scrollY > 420) {
            this.fixUnresolved = true;
        }
        else {
            this.fixUnresolved = false;
        }
    }

    checkRevisonsMade(typeString: string = '') {
        let itemsSkipped: any = [];
        let rowRevisionsMade: any = [];
        let rowRevisionsUpdate: any = [];
        (this.oldRowItemsRoaster.length === this.rowItemsRoaster.length) && (this.oldRowItemsRoaster.length > 0) && this.oldRowItemsRoaster.forEach((oldRowObj: any, oldRowObjIndex: number) => {
            Object.keys(oldRowObj).forEach((oldRowObjKey: string, oldRowObjKeyIndex: number) => {
                if ((this.dateFields.indexOf(oldRowObjKey) === -1) && (this.phoneNumberFields.indexOf(oldRowObjKey) === -1) && (oldRowObj[oldRowObjKey].value !== this.rowItemsRoaster[oldRowObjIndex][oldRowObjKey].value)) {
                    rowRevisionsUpdate.push(`${oldRowObjIndex}:${oldRowObjKey}`);
                    rowRevisionsMade.push(oldRowObjIndex);
                }
                if (this.phoneNumberFields.indexOf(oldRowObjKey) !== -1) {
                    if ((oldRowObj[oldRowObjKey].value.replace(/-/g, '') !== this.rowItemsRoaster[oldRowObjIndex][oldRowObjKey].value.replace(/-/g, ''))) {
                        rowRevisionsUpdate.push(`${oldRowObjIndex}:${oldRowObjKey}`);
                        rowRevisionsMade.push(oldRowObjIndex);
                    }
                }
                if (this.dateFields.indexOf(oldRowObjKey) !== -1) {
                    if (this.generateFormattedDate(oldRowObj[oldRowObjKey].value) !== this.generateFormattedDate((this.rowItemsRoaster[oldRowObjIndex][oldRowObjKey].value))) {
                        rowRevisionsUpdate.push(`${oldRowObjIndex}:${oldRowObjKey}`);
                        rowRevisionsMade.push(oldRowObjIndex);
                    }
                }

            })
        })
        itemsSkipped = this.issuesContainer.map((item: any) => item.count === 2).filter((item: any) => item === true);
        let revisionsObject = {
            rowsRevised: this.removeDuplicates(rowRevisionsMade).length,
            revisionsMade: this.removeDuplicates(rowRevisionsUpdate).length,
            itemsSkipped: itemsSkipped.length,
            arrayRowsRevised: rowRevisionsMade
        }
        this.revisionsObject = revisionsObject;
        if (typeString == '') {
            this.popupStatus = true;

        }
        this.postTableRowData(false);
        if (typeString == '') {
            this.goPage = '';
            this.isSearching = false;
            setTimeout(() => {
                if (UIkit.modal('#unresoved-issue')) {
                    UIkit.modal('#unresoved-issue').show();
                }
            }, 10);
        }
    }

    moveToNext() {
        this.isSearching = false;
        this.nextScreen('error_screen', this.revisionsObject);
        this.popupStatus = false;
        this.pageMove = {
            isPageChange: true,
            pageIndex: 1,
            pageChange: true
        }
        this.columnsRoaster = JSON.parse(JSON.stringify(APP_CONST.SCHOLAR_COLUMN_ROSTER));
        this.rowItemsRoaster = [];
        let configureObj: any = {};
        configureObj = {
            "siteId": this.getGlobalState.siteId,
            "isFinalSubmit": true,
            "rosterStep": 5,
            "step4": [],
            "step5": []
        }
        configureObj.step4 = [];
        setTimeout(() => {
            if (UIkit.modal('#unresoved-issue')) {
                UIkit.modal('#unresoved-issue').hide();
            }
            if (!this.popupStatus && (this.componentName == 'error_screen' || this.componentName == 'repair-table')) {
                this.dataLoaded = false;
                scholar.configureScholarRoaster(configureObj).then((response: any) => {
                    if (response.status == 200) {
                        if(this.componentName != 'error_screen'){
                            this.autoSaveValue = true;
                            this.getDataForPage(1, 'moveNext');
                        }
                    }
                    this.dataLoaded = true;
                });
            }
        }, 700)

        this.scholarsSearchCount = 0;
        this.activeCountScholars = 0;
    }

    
    moveToFinalStep(){
        this.popupStatus = false;
        this.$router.push('/roster');
        /* istanbul ignore else */
        if(this.componentName != 'error_screen'){
            var date = new Date();
            date.setTime(date.getTime()+(10*1000));
            var expires = "; expires="+date.toUTCString();
            document.cookie = 'scholarconfiguring'+"="+ JSON.stringify({process: true}) +expires+"; path=/";
            this.moveToNext();
        }
    }

    moveToStep5() {
        this.disableViewRoster = true;
        this.isStep5moved = true;
        this.deleteErrorData();
    }

    closePopup() {
        this.popupStatus = false;
        if (UIkit.modal('#unresoved-issue')) {
            UIkit.modal('#unresoved-issue').hide();
        }
    }

    fillTabeResData(tableRes: any) {
        this.apiTableDetails = tableRes;
        this.rowItemsRoaster = [];
        let rowObjPrivate: any = JSON.parse(JSON.stringify({ ...APP_CONST.ROW_OBJ_TABLE }));
        let valuesToConsider = tableRes.data[0].cellValues.map((item: any, index: number) => item.cellValue);
       
        let rowObjKeysValidate: any = [];
        let customKeysValidate: any = [];
        let mappedFields: any = JSON.parse(JSON.stringify(APP_CONST.MAPPED_FIELDS));
       this.headerValuesToConsider=valuesToConsider
        valuesToConsider.forEach((item: any, index: number) => {
            let itemFound = false;
            mappedFields.forEach((mapField: any, mapFieldIndex: number) => {
                if (Object.keys(mapField)[0] === item) {
                    rowObjKeysValidate.push(Object.values(mapField)[0]);
                    itemFound = true;
                }
            })
            if (!itemFound) {
                customKeysValidate.push(item);
            }

        })
        Object.keys(rowObjPrivate).forEach((ObjKey: any, ObjKeyIndex: number) => {
            if (rowObjKeysValidate.indexOf(ObjKey) == -1) {
                delete rowObjPrivate[ObjKey];
                let deleteIndex = [...this.columnsRoaster].findIndex((col: any) => col.tempColumnName === ObjKey);
                let columnsRoaster: any = this.columnsRoaster;
                deleteIndex !== -1 && (columnsRoaster.splice(deleteIndex, 1));
            }
        })
      
       
        customKeysValidate.forEach((customValue: any, customValueIndex: number) => {
            let obj: any = {};
            let key = customValue;
            obj[key] = customValue;
            mappedFields.push(obj);
            rowObjPrivate[customValue] = {
                value: '',
                issueType: '',
                columnType: ['Custom Fields'],
                isRequired: false,
                isHidden: false
            };
            let colObject = {
                customColumn: customValueIndex,
                columnName: customValue,
                columnTitle: customValue,
                hasIssue: false,
                columnType: ['Custom Fields'],
                isRequired: false,
                isHidden: false,
                order: 0
            }
            this.columnsRoaster[this.columnsRoaster.length] = colObject;
        })

        tableRes.data.length > 0 && tableRes.data.forEach((itemRow: any, itemRowIndex: number) => {
            if (itemRowIndex !== 0 && itemRow.cellValues.length > 0) {
                let countStart = false;
                let keysLength = Object.keys(tableRes.data[0].cellValues).length;
                if (tableRes.data[0].cellValues[0].cellValue.toLowerCase() === 'count') {
                    countStart = true;
                }
                let newRowObjPrivate = JSON.parse(JSON.stringify(rowObjPrivate));
                itemRow.cellValues.forEach((rowCell: any, rowCellIndex: number) => {
                    if (countStart) {
                        if (rowCellIndex !== 0 && rowCellIndex <= (keysLength - 1)) {
                            let mappedKeyValueIndex = mappedFields.map(function (item: any) { return Object.keys(item)[0]; }).indexOf(tableRes.data[0].cellValues[rowCellIndex].cellValue)
                            let mappedIndexValue: any = mappedFields[mappedKeyValueIndex] && Object.values(mappedFields[mappedKeyValueIndex])[0];
                            mappedIndexValue && (newRowObjPrivate[mappedIndexValue] && (newRowObjPrivate[mappedIndexValue].value = rowCell.cellValue));
                        }
                    }
                    else {
                        /* istanbul ignore else */
                        if (rowCellIndex <= (keysLength - 1)) {
                            let mappedKeyValueIndex = mappedFields.map(function (item: any) { return Object.keys(item)[0]; }).indexOf(tableRes.data[0].cellValues[rowCellIndex].cellValue)
                            let mappedIndexValue: any = mappedFields[mappedKeyValueIndex] && Object.values(mappedFields[mappedKeyValueIndex])[0];
                            mappedIndexValue && (newRowObjPrivate[mappedIndexValue] && (newRowObjPrivate[mappedIndexValue].value = rowCell.cellValue));
                        }
                    }

                })
                this.rowItemsRoaster.push(newRowObjPrivate);
            }
        })
        let hash = Object.create(null),
            result = [];
        let data = this.columnsRoaster;
        for (let i = 0; i < data.length; i++) {
            /* istanbul ignore else */
            if (!hash[data[i].columnName]) {
                hash[data[i].columnName] = true;
                result.push(data[i]);
            }
        }
        this.columnsRoaster = result; 
        let customIndexes: any = [];
        this.columnsRoaster.forEach((columnObj: any, columnObjIndex: number) => {
            if (columnObj.columnType[0] === "Custom Fields") {
                customIndexes.push(columnObjIndex);
            }
        })
        this.customIndexes = customIndexes;
        this.sortArrayIndexes = [APP_CONST.ZERO, APP_CONST.ONE, APP_CONST.TWO];
        let sortedColumns = [false, false, false];
        this.customIndexes.forEach((customItem: any) => {
            sortedColumns.push(false);
        })
        this.sortedColumns = sortedColumns;
        let classroomValues: any = [];
        this.rowItemsRoaster.forEach((rowObject: any, rowObjectIndex: number) => {
            Object.keys(rowObject).forEach((rowObjectKey: any) => {
                /* istanbul ignore else */
                if (rowObjectKey === 'classroom') {
                    if (rowObject[rowObjectKey].value.length !== 0) {
                        classroomValues.push(rowObject[rowObjectKey].value.trim());
                    }
                }
            })
        })
        classroomValues = this.removeDuplicates(classroomValues);
        classroomValues.length > 0 && (this.classRoomOptions = classroomValues);

        setTimeout(() => {
            this.autoformatPhoneNumberDate();
            this.populateIssueToResolve('createTime');
            this.oldRowItemsRoaster = JSON.parse(JSON.stringify(this.rowItemsRoaster));
        }, 500)
        this.activeScholars();
        if(this.defaultSelectionDrop == 'Scholar Info'){
            this.changeDisplayView('Scholar Info');
        }
        else{
            this.changeDisplayView(this.defaultSelectionDrop);
        }
    }

    getTableData(stepObjNew: any, type: string = '') {
        this.searchNoContentCase = false;
        this.dataLoaded = false;
        let stepObj = {
            siteId: stepObjNew.siteId,
            stepNumber: stepObjNew.stepNumber,
            id: stepObjNew.id,
            active: stepObjNew.active,
            search: stepObjNew.search,
            page: stepObjNew.page,
            count: stepObjNew.count,
            sortField: stepObjNew.sortField,
            sortDir: stepObjNew.sortDir
        }
        if ((stepObj.stepNumber == 5) && type == '') {
            this.callAutoSaveTable([], false);
        }
        else if (stepObj.stepNumber == 4 && type == 'toggle') {
            stepObj.stepNumber = 4;
            this.callStep5Table(stepObj);
        }
        else {
            if(!this.autoSaveValue){
            scholar.fetchAutoSaveTable(stepObj).then((tableAutoSaveRes: any) => {
                this.dataLoaded = true;
                if (tableAutoSaveRes.status === APP_CONST.RESPONSE_200) {
                    this.onLoadData = true;
                    if (tableAutoSaveRes.data.step3.length > 1) {
                        var element: any = document.getElementsByClassName('alert-risk');
                        for (let i = 0; i < element.length; i++) {
                            element[i].style.border = null
                            element[i].style.borderTop = null;
                            element[i].style.borderLeft = null
                            element[i].style.borderRight = null
                            element[i].style.borderBottom = null
                        }
                        this.rowItemsRoaster = [];
                        let step3Data = {
                            data: tableAutoSaveRes.data.step3
                        }
                        this.unresolvedStep3Validations = tableAutoSaveRes.data.step3ValidationResults;
                        this.scholarsSearchCount = tableAutoSaveRes.data.step3TotalCount;
                        this.activeCountScholars = tableAutoSaveRes.data.step3TotalActiveCount;
                        this.fillTabeResData(step3Data);
                    }
                    else {
                        this.rowItemsRoaster = [];
                        this.searchNoContentCase = true;
                        if (this.componentName == 'repair-table' && this.isSearchFocused !== true) {
                            this.searchNoContentCase = false;
                            scholar.fetchTableDetails(stepObj).then((tableRes: any) => {
                                if (tableRes.status === APP_CONST.RESPONSE_200) {
                                    let newtableRes: any = {
                                        data: tableRes.data.result.results
                                    }
                                    this.searchNoContentCase = false;
                                    this.unresolvedStep3Validations = tableRes.data.validationResults;
                                    this.scholarsSearchCount = tableRes.data.result.count;
                                    this.activeCountScholars = tableRes.data.result.totalActiveCount;
                                    this.fillTabeResData(newtableRes);
                                }
                            }).catch((err) => {
                            })
                        }

                    }
                }


            }).catch((err) => {
                this.dataLoaded = true;
            })
        
        
        }
       }
    }

    postTableRowData(finalSubmit: boolean) {
        let rowsRevised: any = [];
        let rowsToPost: any = [];
        rowsRevised = this.revisionsObject.arrayRowsRevised;
        let apiTableDetail = this.apiTableDetails;
        let mapFields:any
        this.apiTableDetails.data && this.apiTableDetails.data.length > 0 && this.apiTableDetails.data.forEach((itemRow: any, itemRowIndex: number) => {
            if (itemRowIndex !== 0) {
                /* istanbul ignore else */
                if (rowsRevised.indexOf(itemRowIndex - 1) !== -1) {
                   let customColumnArray:any= this.findCustomColumn(itemRowIndex)
                    if(customColumnArray.length){
                       mapFields=[...APP_CONST.MAPPED_FIELDS,...customColumnArray]
                    }else{
                        mapFields=[...APP_CONST.MAPPED_FIELDS]
                    }
                    let countStart = false;
                    let keysLength = Object.keys(this.apiTableDetails.data[0].cellValues).length;
                    if (this.apiTableDetails.data[0].cellValues[0].cellValue.toLowerCase() === 'count') {
                        countStart = true;
                    }
                    itemRow.cellValues.forEach((rowCell: any, rowCellIndex: number) => {
                        if (countStart) {
                            if (rowCellIndex !== 0 && rowCellIndex <= (keysLength - 1)) {
                                let valueToFind = this.apiTableDetails.data[0].cellValues[rowCellIndex].cellValue;
                                let mappedKeyValueIndex = mapFields.map(function (item: any) { return Object.keys(item)[0]; }).indexOf(valueToFind);
                                let mappedIndexValue = mapFields[mappedKeyValueIndex];
                                mappedIndexValue && (this.apiTableDetails.data[itemRowIndex].cellValues[rowCellIndex].cellValue = this.rowItemsRoaster[itemRowIndex - 1] && (this.rowItemsRoaster[itemRowIndex - 1][Object.values(mappedIndexValue)[0] as string].value));
                            }
                        }
                        else {
                            /* istanbul ignore else */
                            if (rowCellIndex <= (keysLength - 1)) {
                                let valueToFind: string = { ...apiTableDetail }.data[0].cellValues[rowCellIndex]['cellValue'];
                                let mappedKeyValueIndex = mapFields.map(function (item: any) { 
                                    return Object.keys(item)[0]; }).indexOf(valueToFind);
                                let mappedIndexValue = mapFields[mappedKeyValueIndex];
                                mappedIndexValue && (this.apiTableDetails.data[itemRowIndex].cellValues[rowCellIndex].cellValue = this.rowItemsRoaster[itemRowIndex - 1] && (this.rowItemsRoaster[itemRowIndex - 1][Object.values(mappedIndexValue)[0] as string].value));
                            }
                        }
                    })

                    rowsToPost.push(this.apiTableDetails.data[itemRowIndex]);
                }

            }

        })
        this.callAutoSaveTable(rowsToPost, finalSubmit);

    }
   findCustomColumn(itemRowIndex:number){
       let mapArray:any=[]
       let obj=this.rowItemsRoaster[itemRowIndex]
       if(obj){
        Object.keys(obj).forEach((objData)=>{
          if(obj[objData].columnType.includes("Custom Fields")){
            mapArray.push({[objData]:objData})
          }
        })
    }
        return mapArray
   }
    callAutoSaveTable(updatedRows: any, finalSubmit: boolean) {
        let componentName = this.componentName;
        let stepNumber = componentName == 'repair-table' ? 3 : componentName == 'error_screen' ? 4 : 5;
        let configureObj: any = {};
        if (updatedRows.length > 0 && stepNumber == 3) {
            configureObj = {
                "siteId": this.getGlobalState.siteId,
                "isFinalSubmit": finalSubmit,
                "rosterStep": stepNumber,
                "step3": []
            }
            configureObj.step3 = updatedRows.length > 0 ? updatedRows : [];
        }
        else if (stepNumber == 4) {
            configureObj = {
                "siteId": this.getGlobalState.siteId,
                "isFinalSubmit": finalSubmit,
                "rosterStep": stepNumber + 1,
                "step4": [],
                "step5": []
            }
            configureObj.step4 = [];
        }
        else if (stepNumber == 5) {
            configureObj = {
                "siteId": this.getGlobalState.siteId,
                "isFinalSubmit": finalSubmit,
                "rosterStep": stepNumber,
                "step5": []
            }
            configureObj.step5 = [];
        }
        if (!this.popupStatus && (this.componentName == 'step5' || this.componentName == 'repair-table')) {
            scholar.configureScholarRoaster(configureObj).then((response: any) => {
                if (response.status == 200) {
                }
            });
        }

        if ((finalSubmit === true) && this.componentName === 'repair-table') {
            let newConfigObj = {
                "siteId": this.getGlobalState.siteId,
                "isFinalSubmit": finalSubmit,
                "rosterStep": 4,
                "step1": true,
                "step2": this.getGlobalState.step2AutoSave,
                "step3": (updatedRows.length > 0) ? updatedRows : [],
                "step4": []
            }
            scholar.configureScholarRoaster(newConfigObj);
        }
    }
    created() {
        this.isMobileForAPiCall = APP_UTILITIES.mobileAndTabletCheck()
        this.currentPage=0
        this.getDataForPage(1);
        this.lastSortedHeader = this.columnsRoaster[this.lastSortedIndex]
    }
    beforeCreate() {
        this.isMobileForAPiCall = APP_UTILITIES.mobileAndTabletCheck()
    }
  
    openAddPanel(status: any, type: string, isModalShow: boolean) {
        let scholarPanelEl = document.getElementById("openRoasterPanel");
        this.openCreatePanel = status;
        this.panelTitle = type ? type : "";
        if (scholarPanelEl) {
            scholarPanelEl['scrollTop'] = 0;
        }
        if (UIkit.offcanvas('#offcanvas-flip-openRoasterPanel')) {
            UIkit.offcanvas('#offcanvas-flip-openRoasterPanel').toggle();
        }
        this.closeScholarPopup();
        if (isModalShow) {
            if (this.checkIsPopupOpen()) {
                UIkit.modal('#add-scholar-confirmation').show();
                document.body.style.pointerEvents = "none"
            }
        }


    }

    checkIsPopupOpen(): boolean {
        let isPopupOpenAuth = LocalStorage.getFromLocalStorage("isScholerPoppopShow")
        if (APP_UTILITIES.getCookie('auth_token') != isPopupOpenAuth) {
            LocalStorage.deleteFromLocalStorage("isScholerPoppopShow")
            return true
        } else
            return false
    }
    openEditPanel(status: any, rowItem: any, index: any) {
        let secondData = this.secondBody[index];
        let rowItems={...rowItem, ...secondData};
        let bellXcelId = rowItems['bellXcelId'].value || '';
        let documents: any = []
        for (let i = 0; i < this.step5Scholars.length; i++) {
            if (bellXcelId == this.step5Scholars[i].uid) {
                this.familyArray = this.step5Scholars[i].families;
                this.emergencyArray = this.step5Scholars[i].emergencyContacts;
                documents = this.step5Scholars[i].documents;
                break;
            }
        }
        this.rowIds = this.idsAccumulator[index];
        rowItems.documents.value = documents
        this.editableRow = JSON.parse(JSON.stringify(rowItems));
        this.openAddPanel(true, 'Edit', false);

    }

    download() {
        const programId = (this.userDetails.programId === 0) ? APP_UTILITIES.getCookie('programId') : this.userDetails.programId;
        const siteId = this.userDetails.siteId;
        const fileType = 2;
        let step = window.location.href.indexOf('/new') > -1 ? 4 : -1
        let sortingParam = {
            sortField: this.step5ParametersStore ? this.step5ParametersStore.sortField ?
                this.step5ParametersStore.sortField : 'lastName' : 'lastName',
            sortDir: this.step5ParametersStore ? this.step5ParametersStore.sortDir ?
                this.step5ParametersStore.sortDir : 1 : 1
        }
        downloadRoaster(siteId, programId, step, fileType, sortingParam);
    }

    destroyed() {
        document.removeEventListener('scroll', this.handleScrollBehaviour);
        window.removeEventListener("resize", this.isMobile);
        window.removeEventListener( 'mousewheel', this.onMouseWheel, false );
        window.removeEventListener( 'touchmove', this.onMouseWheel, false );
    }

    closeScholarPopup() {
        if (UIkit.modal('#add-scholar-confirmation')) {
            UIkit.modal('#add-scholar-confirmation').hide();
        }
    }
    openFilePopup() {
        UIkit.modal('#file-name-confirmation').show();

    }
    closeFilePopup() {
        if (UIkit.modal('#file-name-confirmation')) {
            UIkit.modal('#file-name-confirmation').hide();
        }
    }
    fileReplace() {
        let csvInstance: any = this.$refs.addscholar;
        csvInstance.replaceFile();
        this.closeFilePopup()
    }
    bothFile() {
        let csvInstance: any = this.$refs.addscholar;
        csvInstance.bothFile();
        this.closeFilePopup()


    }

    setAmulatorforEmergency(item: any) {
        let emergencyArray = []
        /* istanbul ignore else */
        if (item.emergencyContacts.length > 0) {
            for (let i = 0; i < item.emergencyContacts.length; i++) {
                let data = {
                    'id': item.emergencyContacts[i].id,
                    'scholarProgramSiteMappingId': item.emergencyContacts[i].scholarProgramSiteMappingId
                }
                emergencyArray.push(data)
            }
        }
        return emergencyArray
    }

    setAmulatorforFamilies(item: any) {
        let familiesArray = []
        /* istanbul ignore else */
        if (item.families.length > 0) {
            for (let i = 0; i < item.families.length; i++) {
                let data = {
                    'id': item.families[i].id,
                    'scholarProgramSiteMappingId': item.families[i].scholarProgramSiteMappingId
                }
                familiesArray.push(data)
            }
        }
        return familiesArray
    }

    setIdAmulatorForEditScholar(item: any) {

        let indexAmulator = this.idsAccumulator.findIndex((listItem: any) => listItem.id === item.id);
        const index = this.idsAccumulator.indexOf(item.id);
        if (index > -1) {
            this.idsAccumulator.splice(index, 1);
        }
        let familiesArray = this.setAmulatorforFamilies(item)
        let emergencyArray = this.setAmulatorforEmergency(item)
        let scholarRow = {
            id: item.id,
            address: {
                id: item.address ? item.address.id : 0,
                scholarProgramSiteMappingId: item.address ? item.address.scholarProgramSiteMappingId : 0
            },
            consent: {
                id: item.consent ? item.consent.id : 0,
                scholarProgramSiteMappingId: item.consent ? item.consent.scholarProgramSiteMappingId : 0
            },
            emergencyContacts: emergencyArray,
            families: familiesArray,
            medical: {
                id: item.medical ? item.medical.id : 0,
                scholarProgramSiteMappingId: item.medical ? item.medical.scholarProgramSiteMappingId : 0
            }
        };
        this.idsAccumulator[indexAmulator] = scholarRow;
    }

    closeSearchPopup() {
        let filterSearch = this.$refs.filterPanels as any;
        if(filterSearch){
        filterSearch.hide()
        }
    }

    searchQuery(query: string) {
        /* istanbul ignore else */
        if (query.length >= 1) {
            this.isShowCrossIcon = (!this.isShowCrossIcon) ? true : false
            this.query = this.mobileQuery
            this.isSearching = true;
            this.searchUsingQuery(query)
            this.closeSearchPopup()
        }
    }
    isPaginatioShow() {
        /* istanbul ignore else */
        if (!this.isMobileForAPiCall) {
            return this.scholarsSearchCount > 25  ? true : false
        } else {
            return this.scholarsSearchCount > 10  ? true : false
        }
    }

    sortOnEdit() {
        if (this.firstNameSorted || this.lastNameSorted || this.birtDaySorted) {
            this.sortDir = this.sortDir == 1 ? 2 : 1;
            this.sortRequired = false;
            this.toggleSortedColumn();
        }
    }

    toggleSortedColumn() {
        if (this.firstNameSorted) {
            this.getSortingDefault()
        } else if (this.lastNameSorted) {
            this.getSortingDefault()
        } else if (this.birtDaySorted) {
            this.getSortingDefault()
        } else {
            this.getSortingDefault()
        }

    }
    openDeteleRoster() {
        if (UIkit.modal('#Delete-Roster-confirmationPopUp')) {
            UIkit.modal('#Delete-Roster-confirmationPopUp').show();
        }
    }
    closeDeleteRosterPopup() {
        if (UIkit.modal('#Delete-Roster-confirmationPopUp')) {
            UIkit.modal('#Delete-Roster-confirmationPopUp').hide();
        }
    }

    async deleteRosterData() {
        const siteId = this.userDetails.siteId;
        let response: any = await deleteBulkRoaster(siteId)
        /* istanbul ignore else */

        if (response.status == 200) {
            this.$emit("showDeleteToastMsg");
            this.closeDeleteRosterPopup()
            this.reupload();
            this.showDeleteToastMsg = true;
        }
    }
    toggleDrop() {
        this.toggleDropDown = !this.toggleDropDown
    }
    dropDownHandler(dropMenu: string) {
        if(!this.isSignalRProcessing){
            switch (dropMenu) {
                case this.dropDwonMenu[0]:
                    this.openAddPanel(true, '', false)
                    break;
                case this.dropDwonMenu[1]:
                    this.reupload()
                    break;
                case this.dropDwonMenu[2]:
                    this.openDeteleRoster()
                    break;

                default:
                    break;
            }
        }
    }
    checkScholerLength(dropMenu: string) {
        if (dropMenu == this.dropDwonMenu[2] && this.no_data_roaster == 'enable' && !this.onLoadData) {
            return true
        }
        return false

    }
    beforeDestroy() {
        if(!this.errorAlreatDeleted && this.componentName == 'error_screen'){
            var date = new Date();
            date.setTime(date.getTime()+(10*1000));
            var expires = "; expires="+date.toUTCString();
            document.cookie = 'scholarconfiguring'+"="+JSON.stringify({delete: true})+expires+"; path=/";
            this.deleteErrorData();
        }
        if (UIkit.modal(`#add-scholar-confirmation`)) {
            UIkit.modal(`#add-scholar-confirmation`).$destroy(true);
        }
        if (UIkit.modal(`#file-name-confirmation`)) {
            UIkit.modal(`#file-name-confirmation`).$destroy(true);
        }

    }
    openSearchPopup() {
        // fixed sidepanel issue
    }

    setSortingDefault(customColumn?: any) {
        let createKey = this.authKey + "_roster_sort";
        let sortOrder = (this.order == 1 || this.order == 0) ? '1' : '2';
        if (this.sortFieldTitle) {
            APP_UTILITIES.setSortingOnSession(createKey, this.sortFieldTitle, sortOrder, customColumn);
        }
    }
    getSortingDefaultOnPagination(stepObj: any) {
        let createKey = this.authKey + "_roster_sort";
        let sortVal: string | null = "";
        if (APP_UTILITIES.getSortingOnSession(createKey)) {
            sortVal = APP_UTILITIES.getSortingOnSession(createKey);
            let sortObj: { key: string, dir: string, customColumn: string } = sortVal ? JSON.parse(sortVal) : {};
            let checkCustomColumn = false;
            this.columnsRoaster.forEach((columnObj: any, columnObjIndex: number) => {
                if (columnObj.columnTitle === sortObj.key) {
                    let columnSelected = this.columnsRoaster[columnObjIndex];
                    this.firstNameSorted = false;
                    this.lastNameSorted = false;
                    checkCustomColumn = true
                    this.sortDir = this.order = sortObj.dir == '1' ? 2 : 1;
                    columnObj.order = this.sortDir;
                    let sortName: any = (stepObj.stepNumber == 4 || stepObj.stepNumber == 5) ? columnSelected.columnType.includes("Custom Fields") ? this.checkCustomcolumn(columnObjIndex, 'filter') : columnSelected.columnName : this.checkStep3Values(columnSelected.columnTitle)
                    this.sortField = sortName
                    stepObj.sortField = sortName
                    stepObj.sortDir = this.sortDir ? this.sortDir : 1;
                    if (stepObj.stepNumber == 4 || stepObj.stepNumber == 5) {
                        this.callStep5Table(stepObj)
                    } else {
                        this.getTableData(stepObj);
                    }
                }else{
                    if (columnObj.order) {
                        columnObj.order = 0;
                    }
                }
            })

            if (!checkCustomColumn && this.componentName != 'repair-table') {
                let columnSelected = {
                    columnIndex: sortObj.customColumn,
                    columnName: sortObj.key,
                    columnTitle: sortObj.key,
                    columnType: ["Custom Fields"],
                    hasIssue: false,
                    isHidden: true,
                    isRequired: false,
                    order: 1
                }

                this.firstNameSorted = false;
                this.lastNameSorted = false;
                this.sortDir = this.order = sortObj.dir == '1' ? 2 : 1;
                columnSelected.order = this.sortDir;
                this.columnsRoaster.push(columnSelected)
                let sortName: any = (stepObj.stepNumber == 4 || stepObj.stepNumber == 5) ? columnSelected.columnType.includes("Custom Fields") ? this.checkCustomcolumn(columnSelected.columnIndex, 'filter') : columnSelected.columnName : this.checkStep3Values(columnSelected.columnTitle)
                this.sortField = sortName
                stepObj.sortField = sortName
                stepObj.sortDir = this.sortDir ? this.sortDir : 1;
                if (stepObj.stepNumber == 4 || stepObj.stepNumber == 5) {
                    this.callStep5Table(stepObj)
                } else {
                    this.getTableData(stepObj);
                }
            }
            return true
        } else {
            this.setSortingDefault();
            return false
        }
        return false
    }
    getSortingDefault() {
        let createKey = this.authKey + "_roster_sort";
        let sortVal: string | null = "";
        if (APP_UTILITIES.getSortingOnSession(createKey)) {
            sortVal = APP_UTILITIES.getSortingOnSession(createKey);
            let sortObj: { key: string, dir: string, customColumn: string } = sortVal ? JSON.parse(sortVal) : {};
            let checkCustomColumn = false;
            this.columnsRoaster.forEach((columnObj: any, columnObjIndex: number) => {
                if (columnObj.columnTitle === sortObj.key) {
                    let columnSelected = this.columnsRoaster[columnObjIndex];
                    this.firstNameSorted = false;
                    this.lastNameSorted = false;
                    checkCustomColumn = true
                    this.sortDir = this.order = sortObj.dir == '1' ? 2 : 1;
                    columnObj.order = this.sortDir;
                    this.toggleSort(columnSelected, columnObjIndex);
                }
            })

            if (!checkCustomColumn && this.componentName != 'repair-table') {
                let columnSelected = {
                    columnIndex: sortObj.customColumn,
                    columnName: sortObj.key,
                    columnTitle: sortObj.key,
                    columnType: ["Custom Fields"],
                    hasIssue: false,
                    isHidden: true,
                    isRequired: false,
                    order: 1
                }

                this.firstNameSorted = false;
                this.lastNameSorted = false;
                this.sortDir = this.order = sortObj.dir == '1' ? 2 : 1;
                columnSelected.order = this.sortDir;
                this.columnsRoaster.push(columnSelected)
                this.toggleSort(columnSelected, 50);
            }
            return true
        } else {
            this.setSortingDefault();
            return false
        }
        return false
    }

    hideSortingOnCustomColumn(componentName: string, column: any) {
        if (componentName == 'repair-table') {
            if (column.columnType.includes('Custom Fields')) {
                return false
            }
            return true
        }
        return true
    }

    deleteErrorData(){
        /* istanbul ignore else */
        if(this.componentName == 'error_screen'){
            deleteRoasterErrorTable(this.getGlobalState.siteId).then((response:any) => {
                /* istanbul ignore else */
                if(response){
                    this.errorAlreatDeleted = true;
                    if(this.componentName == 'error_screen' && this.isStep5moved){
                        this.isStep5moved = false;
                        this.disableViewRoster = false;
                        this.$router.push('/roster');
                    }
                }
            })
        }
    }
  

}

