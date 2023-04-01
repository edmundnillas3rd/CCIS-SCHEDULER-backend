import { Route, Routes } from "react-router-dom";
import Details from  "./DetailComponents/Details";
import AvailableMeetingList from  "./AvailableMeetingList";
import PendingMeetingsList from  "./PendingMeetingsList";
import ActiveMeetingList from  "./ActiveComponents/ActiveMeetingsList";
import JoinedMeetingsList from "./JoinedMeetingsList";
import ArchiveMeetingList from "./ArchiveComponents/ArchiveMeetingList";
import CreateMeeting from "./CreateMeeting";

export default function Main() {
  return (
    <Routes>
            <Route path="details" element={<Details/>}/>
            <Route path="available-meetings" element={<AvailableMeetingList/>}/>             
            <Route path="pending-meetings" element={<PendingMeetingsList/>}/>
            <Route path="active-meetings" element={<ActiveMeetingList/>}/>
            <Route path="joined-meetings" element={<JoinedMeetingsList/>}/>
            <Route path="archive-meetings" element={<ArchiveMeetingList/>}/>
            <Route path="create-meeting" element={<CreateMeeting/>}/>
    </Routes>
  )
}
