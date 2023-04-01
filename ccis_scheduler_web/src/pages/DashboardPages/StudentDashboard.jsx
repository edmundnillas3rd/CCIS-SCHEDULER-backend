import { Link, Outlet, useLoaderData} from "react-router-dom";
import {AiOutlineSetting} from "react-icons/ai"
import SidebarData from "../../Data/SideBarData";
import StudentProfile from "../../Data/SampleProfileData";
import { useState } from "react";

export default function Dashboard () {
const [selected, setSelected] = useState(0);
const [selectedCreate, setSelectedCreate] = useState(false);
const dataloader = useLoaderData()

    return ( 
        <div className="dashboard-container">

            <div className="sidebar-wrapper">
                <div>Scheduler Dashboard</div>
                <div className="item-wrapper">
                    {
                     SidebarData.map((item, index) => (
                          <Link 
                                to={item.path}  
                                key={index} className="link" 
                                onClick={()=>
                                {
                                    setSelected(index)
                                    setSelectedCreate(false)
                                }}>
                        
                                <div className={index == selected ? "item selected": "item"}> 
                                  <div>
                                      <item.icon/>
                                  </div>
                                  <div>
                                      {item.name}
                                  </div>      
                                </div>
                          </Link>
                    ))
                    }
                </div>
                <div className="preview-profile">
                    <img src={dataloader.image} alt="" />
                    <p>{dataloader.fullname}</p>
                    <Link to="/student/profile" className="link"><AiOutlineSetting/></Link>
                </div>
            </div>

            <div className="outlet-wrapper">
                <div className="outlet-header">
                    <div>
                        Today Is April Fools
                    </div>
                    <div>
                        <Link 
                            to="create-meeting" 
                            className={selectedCreate ? "item selected": "link"}
                            onClick={()=>
                            {
                                setSelected(null)
                                setSelectedCreate(!selectedCreate)
                            }}
                         >+ Create Meeting</Link>
                    </div>
                </div>
                <div>
                 <Outlet/>
                </div>
                    
            </div>
        </div>
     );
}

export const DataLoader = async()=>{
    //try
    //fetch here
    //catch

    return StudentProfile
}
