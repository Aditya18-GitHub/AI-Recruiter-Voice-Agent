import react from "react";
import WelcomeContainer from './_components/WelcomeContainer';
import CreateOptions from "./_components/CreateOptions";
import RecentInterviews from "./_components/RecentInterviews";

function DashboardC() {

    return (
      
      <div className="space-y-6">
        <h2 className='my-3 font-bold text-2xl'>Dashboard</h2>
        <CreateOptions/>
        <RecentInterviews/>
      </div>
    );
  }
  
export default DashboardC;