<template>
  <div class="body" id="printContent">
    <div class='print-heading-program'>{{programName}}</div>
    <div class='print-sub-heading'>{{siteName}}</div>
    <div>
      <div :class="['monthName currentMonthName',resetEvntFilter&&calendarViewEvents=='week' &&'set-month-width']">{{currentMonthName}} {{currentYearNumber}}</div>
      <div id="calender">
        <div id="cardContainerCal">
                <div id="tab1" style="display:block">
                  <div v-if="resetTKFilter" :class="['calendar-view calendar-view-tasks calender-task',calendarViewTasks ==='week'  ? 'calendar-view-week' :'calendar-view-month']">
                      <vue-calendar 
                              ref="valcaltasks1"
                              default-view="month"
                              :time="false"
                              events-on-month-view="short"
                              :disable-views="['years', 'year','day']"
                              :min-event-width="0"
                              :events="tasksShow"
                              :startWeekOnSunday="true"
                              :showWeekNumbers="false"
                              hide-view-selector
                              hide-title-bar
                              @view-change="logTasks('view-change', $event,0)">
                      </vue-calendar>
                  </div>
                </div>
                 <div id="tab2" style="display:block">
                   <div v-if="resetEvntFilter" :class="['calendar-view calendar-view-events calender-events',calendarViewEvents ==='week' ? 'calendar-view-week' :'calendar-view-month']">
                      <vue-calendar 
                                  ref="valcalevents1"
                                  default-view="month"
                                  events-on-month-view="short"
                                  :time-step="30"
                                  :disable-views="['years', 'year','day']"
                                  :min-event-width="0"
                                  :events="eventsShow"
                                  :startWeekOnSunday="true"
                                  hide-view-selector
                                  hide-title-bar
                                  @view-change="logEvents('view-change', $event,1)">
                      </vue-calendar>
                   </div>
                 </div>
            </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="bellxcel-logo-1"
        width="180"
        height="37"
        viewBox="0 0 180 37"
      >
        <g fill="none" fill-rule="evenodd">
          <path
            fill="#002169"
            d="M13.709 36.526C11.186 36.526 8.709 35.816 6.549 34.473L5.23 33.654 5.23 36.318 5.15143483e-14 36.318 5.15143483e-14-8.17124146e-14 5.23-8.17124146e-14 5.23 12.248 6.549 11.428C8.709 10.085 11.186 9.375 13.709 9.375 21.195 9.375 27.284 15.465 27.284 22.95 27.284 30.436 21.195 36.526 13.709 36.526M13.709 14.605C13.351 14.605 12.985 14.628 12.627 14.674 8.928 15.144 5.902 18.169 5.434 21.867 5.13 24.26 5.863 26.663 7.446 28.461 9.033 30.262 11.316 31.296 13.709 31.296 14.068 31.296 14.434 31.273 14.793 31.227 18.49 30.757 21.516 27.732 21.986 24.034 22.289 21.641 21.556 19.237 19.973 17.439 18.386 15.638 16.103 14.605 13.709 14.605M54.8017 25.2246C54.8527 24.6186 54.9037 24.0636 54.9037 23.5086 54.9037 15.8396 50.6157 9.1796 42.1387 9.1796 34.5197 9.1796 29.1217 15.4356 29.1217 23.0556L29.1217 23.1556C29.1217 31.3796 35.0757 36.9796 42.7937 36.9796 47.6877 36.9796 51.1697 35.0116 53.6917 31.9846L50.1097 28.8066C47.9917 30.8746 45.8717 31.9846 42.8947 31.9846 38.9597 31.9846 35.8817 29.5626 35.2257 25.2246L54.8017 25.2246zM48.8487 21.1876L35.1757 21.1876C35.7307 17.0506 38.3547 14.1746 42.0877 14.1746 46.1237 14.1746 48.4457 17.2516 48.8487 21.1876L48.8487 21.1876z"
          />
          <polygon fill="#002169" points="57.344 36.375 63.45 36.375 63.45 .001 57.344 .001" />
          <polygon fill="#002169" points="66.382 36.375 72.486 36.375 72.486 .001 66.382 .001" />
          <polygon fill="#8DC6E8" points="77.052 36.342 86.762 22.953 77.052 9.805" />
          <polygon
            fill="#0083C1"
            points="89.459 9.734 82.799 9.734 92.184 22.802 82.445 36.373 88.955 36.373 95.463 26.888 102.022 36.373 108.682 36.373 98.894 22.751 108.277 9.734 101.77 9.734 95.613 18.664"
          />
          <path
            fill="#3DAE2B"
            d="M120.8545,36.9796 C126.0505,36.9796 129.1275,34.9106 131.7515,31.9846 L128.0695,28.3516 C126.1515,30.3196 124.0325,31.6316 121.1575,31.6316 C116.4635,31.6316 113.1855,27.8476 113.1855,23.1046 L113.1855,23.0046 C113.1855,18.3626 116.4635,14.5276 120.9045,14.5276 C123.9315,14.5276 125.8995,15.8896 127.7655,17.8576 L131.5995,13.7706 C129.0785,11.0466 125.9505,9.1796 120.9555,9.1796 C112.9325,9.1796 107.0805,15.5366 107.0805,23.1046 L107.0805,23.2056 C107.0805,30.7736 112.9325,36.9796 120.8545,36.9796"
          />
          <path
            fill="#D41367"
            d="M146.0946,36.9796 C150.9876,36.9796 154.4696,35.0116 156.9916,31.9846 L153.4096,28.8056 C151.2896,30.8746 149.1706,31.9846 146.1946,31.9846 C142.2596,31.9846 139.1816,29.5626 138.5266,25.2236 L158.1016,25.2236 C158.1516,24.6186 158.2026,24.0636 158.2026,23.5086 C158.2026,15.8396 153.9136,9.1796 145.4386,9.1796 C137.8196,9.1796 132.4196,15.4356 132.4196,23.0546 L132.4196,23.1556 C132.4196,31.3796 138.3736,36.9796 146.0946,36.9796 L146.0946,36.9796 Z M138.4756,21.1876 C139.0306,17.0506 141.6546,14.1746 145.3876,14.1746 C149.4236,14.1746 151.7446,17.2526 152.1486,21.1876 L138.4756,21.1876 Z"
          />
          <polygon fill="#673065" points="160.643 36.374 166.749 36.374 166.749 .001 160.643 .001" />
          <path
            fill="#002169"
            d="M173.365586,32.0365777 L171.738871,32.0365777 L171.738871,36.4161947 L171.004924,36.4161947 L171.004924,32.0365777 L169.339707,32.0365777 L169.339707,31.3756245 L173.365586,31.3756245 L173.365586,32.0365777 Z M179.811484,36.4161947 L179.077537,36.4161947 L179.077537,32.183367 L179.054276,32.183367 L177.353765,36.4161947 L176.876499,36.4161947 L175.175988,32.183367 L175.151924,32.183367 L175.151924,36.4161947 L174.417978,36.4161947 L174.417978,31.3756245 L175.554593,31.3756245 L177.132378,35.2418798 L178.711767,31.3756245 L179.811484,31.3756245 L179.811484,36.4161947 Z"
          />
        </g>
      </svg>
    </div>
  </div>
</template>
<script lang="ts">
import PrintComponent from "@/components/printcomponent/PrintComponent";
export default PrintComponent;
</script>
<style lang="css" scoped src="./PrintComponent.css"></style>