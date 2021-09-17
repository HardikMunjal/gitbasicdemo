import { Vue, Component, Emit } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import APP_UTILITIES from "@/utilities/commonFunctions";
import API_CONST from '@/constants/ApiConst';
import { getModule } from 'vuex-module-decorators';
import { GlobalModule } from '@/store/global/globalModule';
import scholar from '@/store/modules/scholarManager'
import store from '@/store';
import APP_CONST from '@/constants/AppConst';

@Component({
    components: {
        vueDropzone: vue2Dropzone
    }
})
export default class UploadFileComponent extends Vue {
    private objScreenText: ScreenText = new ScreenText();
    getGlobalState = getModule(GlobalModule, store)

   
    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }
    @Emit('next') nextScreen(mode: any) {}

    uploadCSV() {
        this.nextScreen('match-columns');
    }

    public maxFilesize: number = 5242880 
    public totalFilesize: number = 0;
    public maxFileSizeFlag: boolean = false;
    public isCsvFileUploaded: boolean = false;
    public isFileSelected: boolean = false;
    public isFileCorrect: boolean = true;
    public currentCsvFileName: string = "";
    public disableDelete: boolean = false;

    public userRoles : any = [];
    public siteId : any = '';
    public dropzoneOptions: any = {
        method: 'POST',
        url: `${process.env.VUE_APP_BASE_URL}${API_CONST.UPLOAD_CSV}?siteId=`+this.getSiteId(),
        maxFilesize: 5,
        maxFiles: 1,
        headers: {
            'Accept' : '*/*',
            'Authorization': `Bearer ${APP_UTILITIES.getCookie('auth_token')}`
        },
        includeStyling: false,
        chunkSize: 500,
        addRemoveLinks: true,
        acceptedFiles: '.csv,text/csv',
        clickable: true,
        timeout: 180000,
    }

    beforeMount(){
       this.getScholarStatus();
    }

    getScholarStatus() {
        const siteId = this.getSiteId();
        scholar.checkScholarStatus(siteId).then((response: any) => {
            if(response.status === APP_CONST.RESPONSE_200) {
                const fileNameExistence = response.data.autoSaveDraftExists && response.data.fileName;
                if(fileNameExistence){
                    this.isCsvFileUploaded = true;
                    this.isFileSelected = false;
                    this.maxFileSizeFlag = true;
                    this.currentCsvFileName = response.data.fileName;
                }
                this.$store.dispatch('globalModule/getRoasterDraftData',response.data)
            }
        })
    }

    fileAdded(file: any) {
        this.isCsvFileUploaded = false;
        this.isFileSelected = true;
        this.isFileCorrect = true;
        this.maxFileSizeFlag = true;
        this.clearCurrentCSVFile();
    }
    sendingFiles(files: any, xhr: any, formData: any) {
        this.totalFilesize = 0;
        this.totalFilesize = this.totalFilesize + files.size;
        if (this.totalFilesize <= this.maxFilesize) {
            this.maxFileSizeFlag = true;
        } else {
            this.maxFileSizeFlag = false;
            this.removeAllFiles();
        }
    }

    success(file: any, response: any) {
        this.isCsvFileUploaded = true;
        this.isFileSelected = false;
        this.currentCsvFileName = file.name;
        this.removeAllFiles();
    }

    onError(file: any, response: any) {
        if(response === this.getScreenText('DZ_ERROR_FILE_TYPE')){
            this.isFileCorrect = false;
            this.clearCurrentCSVFile();
            this.removeAllFiles();
        }else {
            this.maxFileSizeFlag = false;
            this.removeAllFiles();
            this.isFileCorrect = false;
            this.clearCurrentCSVFile();
        }
    }

    removeAllFiles() {
        let csvInstance: any = this.$refs.myVueDropzone;
        csvInstance.removeAllFiles(true);
    }

    removeCurrentSelection(e:any) {
        this.disableDelete = true;
        let csvInstance: any = this.$refs.myVueDropzone;
        csvInstance.removeEventListeners();
        let siteId : number = this.getSiteId();
        scholar.deleteRoaster(siteId).then((response : any) => {
            if(response.status === 200){
                csvInstance.setupEventListeners();
                csvInstance.removeAllFiles(true);
                this.clearCurrentCSVFile();
                this.isCsvFileUploaded = false;
                this.isFileSelected = false;
                this.maxFileSizeFlag = false;
                this.isFileCorrect = true;
            }
            this.disableDelete = false;
        })
    }

    public getSiteId() {
        let sID = 0;
        let userRoles: any = APP_UTILITIES.getCookie("user_role");
        this.userRoles = JSON.parse(userRoles);
        this.userRoles.forEach((item: any) => {
            if (item.hasOwnProperty("siteId")) {
                sID = item.siteId;
            }
        })
        this.siteId = sID;
        return this.siteId;
    }

    public clearCurrentCSVFile(){
        this.currentCsvFileName = '';
    }
}