import { Vue, Component, Prop } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import APP_UTILITIES from "@/utilities/commonFunctions";
import AccountListComponent from '@/components/accountlistcomponent/AccountListComponent.vue';
import AdminDashboardComponent from '@/components/admindashboardcomponent/AdminDashboardComponent.vue';

@Component({
    components: {
        'account-list': AccountListComponent,
        'admin-dashboard': AdminDashboardComponent
    }
})
export default class RootComponent extends Vue {
    private objScreenText: ScreenText = new ScreenText();
    public userRoles : any = []; 
    public currentRoleId : number = 0;

    @Prop()
    signalRStrip!:{component:string,stripShow:boolean,stripText:string}
    
    @Prop()
    userDetails!: Object;

    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }

    beforeMount(){
        this.getUserRoles();
    }


    public getUserRoles(){
        let userRoles: any = APP_UTILITIES.getCookie("user_role");
        this.userRoles = JSON.parse(userRoles);
        this.userRoles.forEach((item: any, index: number) => {    
            if (item.hasOwnProperty("roleId")) {
                this.currentRoleId = item.roleId;
            }
        })
    }

    public updateDataLayer(data : any){
        this.$emit("updateDataLayer" , data)
    }

}

