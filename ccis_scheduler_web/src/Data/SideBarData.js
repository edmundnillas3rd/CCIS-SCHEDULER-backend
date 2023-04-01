import {RxDashboard, RxEnter} from "react-icons/rx"
import {TbBoxMultiple} from "react-icons/tb"
import {MdOutlinePending} from "react-icons/md"
import {TiGroupOutline} from "react-icons/ti"
import {BiArchiveIn} from "react-icons/bi"
const SidebarData = [
    {
        name: "Details",
        path : "details",
        icon: RxDashboard
    },
    {
        name: "Available Meeting",
        path : "available-meetings",
        icon : TbBoxMultiple
    },
    {
        name: "Your Pending Meetings",
        path : "pending-meetings",
        icon: MdOutlinePending
    },
    {
        name: "Your Active Meetings",
        path : "active-meetings",
        icon: TiGroupOutline
    },
    {
        name: "Joined Meetings",
        path : "joined-meetings",
        icon: RxEnter
    },
    {
        name: "Archives Meeting",
        path : "archive-meetings",
        icon: BiArchiveIn
    }
]

export default SidebarData;