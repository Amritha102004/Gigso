import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

interface Worker {
  _id: string;
  name: string;
  email: string;
  status?: string;
}

const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('worker');
      setWorkers(data.users || data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch workers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async (id: string, currentStatus?: string) => {
    try {
      const isSuspended = currentStatus === 'suspended';
      await adminService.suspendUser(id, !isSuspended); // Toggle API Call
      setWorkers((prev) => prev.map(w => w._id === id ? { ...w, status: isSuspended ? 'active' : 'suspended' } : w));
    } catch (err) {
      alert('Action failed.');
      console.error(err);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>;
      case 'suspended': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Suspended</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status || 'Active'}</span>;
    }
  };

  if (isLoading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
           <h1 className="text-2xl font-bold text-textMain tracking-tight">Worker Management</h1>
           <div className="flex items-center gap-2 mt-1text-xs font-bold text-secondary tracking-widest uppercase">
               <span>Admin</span> 
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
               <span className="text-textMain">Workers</span>
           </div>
        </div>
        <div className="relative">
            <input type="text" placeholder="Search workers..." className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-[250px]" />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Hero Stats Blocks Mimicking Image Structure */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-secondary text-sm font-semibold mb-2">Total Workers</h3>
             <div className="flex items-end justify-between">
                 <span className="text-3xl font-bold text-textMain">{workers.length + 1240}</span>
                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12% this month</span>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
             <h3 className="text-secondary text-sm font-semibold mb-2">Active Now</h3>
             <div className="flex items-end justify-between">
                 <span className="text-3xl font-bold text-textMain">856</span>
                 <span className="text-xs font-bold text-[#848462] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> On duty</span>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-secondary text-sm font-semibold mb-2">Avg. Reliability</h3>
             <div className="flex items-center gap-4 mt-2">
                 <span className="text-3xl font-bold text-textMain tracking-tight">94%</span>
                 <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-primary rounded-full w-[94%]"></div>
                 </div>
             </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8F9FA] text-[#848462] text-[10px] font-bold tracking-widest uppercase border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4">Worker Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {workers.map((worker) => (
                   <tr key={worker._id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm shrink-0"></div>
                               <p className="font-bold text-textMain">{worker.name}</p>
                           </div>
                       </td>
                       <td className="px-6 py-4 text-secondary">{worker.email}</td>
                       <td className="px-6 py-4">
                           <span className="px-2.5 py-1 bg-[#eeefe9] text-primary text-[10px] rounded-full font-bold tracking-wide uppercase border border-[#dcdcd2]">Staff</span>
                       </td>
                       <td className="px-6 py-4">{getStatusBadge(worker.status)}</td>
                       <td className="px-6 py-4 text-right">
                          <button onClick={() => handleSuspendToggle(worker._id, worker.status)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                          </button>
                       </td>
                   </tr>
                ))}
            </tbody>
         </table>
      </div>
      
    </div>
  );
};

export default WorkersPage;
