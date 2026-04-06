import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

interface Owner {
  _id: string; 
  name: string;
  email: string;
  status?: string; 
  businessName?: string;
  location?: string;
  isApproved?: boolean;
  isSuspended?: boolean;
}

const OwnersPage: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsersByRole('owner');
      // Assume mapping is data.users or directly an array based on standard controllers
      const userList = data.users || data || [];
      const mappedOwners = userList.map((u: any) => ({
        ...u,
        status: u.isSuspended ? 'suspended' : (u.isApproved ? 'approved' : 'pending')
      }));
      setOwners(mappedOwners);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch owners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveUser(id);
      // Optimistic update
      setOwners((prev) => prev.map(o => o._id === id ? { ...o, isApproved: true, status: o.isSuspended ? 'suspended' : 'approved' } : o));
    } catch (err) {
      alert('Action failed. Check console.');
      console.error(err);
    }
  };

  const handleSuspendToggle = async (id: string, currentStatus?: string) => {
    try {
      const isSuspended = currentStatus === 'suspended';
      await adminService.suspendUser(id, !isSuspended); // Toggle
      setOwners((prev) => prev.map(o => o._id === id ? { ...o, isSuspended: !isSuspended, status: !isSuspended ? 'suspended' : (o.isApproved ? 'approved' : 'pending') } : o));
    } catch (err) {
      alert('Action failed.');
      console.error(err);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'approved': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Approved</span>;
      case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'suspended': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Suspended</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status || 'Active'}</span>;
    }
  };

  if (isLoading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;

  return (
    <div className="flex-1 p-8 sm:p-10 bg-[#FAF9F6] h-full overflow-y-auto">
      
      {/* Top Header matching Figma specs */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
           <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin - Owner Management</h1>
           <p className="text-secondary text-sm mt-1">Manage business partners and approvals</p>
        </div>
        <div className="flex gap-4">
           {/* Mock search styling matching spec top right corner */}
           <div className="relative">
              <input type="text" placeholder="Search owners..." className="pl-10 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-[250px]" />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
           </div>
           <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 shadow-sm cursor-pointer hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
           </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-bold text-textMain">All Owners</h2>
        <div className="flex gap-2">
            <button className="text-xs font-semibold px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-textMain flex items-center gap-2 shadow-sm">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
                 Filter
            </button>
        </div>
      </div>

      {/* Main Table Structure mapping standard generic responses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8F9FA] text-[#848462] text-xs font-bold tracking-wider uppercase border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Owner Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {owners.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No owners found.</td></tr>
                ) : (
                    owners.map((owner) => (
                    <tr key={owner._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <p className="font-semibold text-textMain">{owner.businessName || 'N/A'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Category</p>
                        </td>
                        <td className="px-6 py-4 text-textMain font-medium">{owner.name}</td>
                        <td className="px-6 py-4 text-secondary">{owner.email}</td>
                        <td className="px-6 py-4">{getStatusBadge(owner.status)}</td>
                        <td className="px-6 py-4 text-right space-x-4">
                           {owner.status === 'pending' && (
                               <button onClick={() => handleApprove(owner._id)} className="text-xs font-bold text-primary hover:text-primary/70 transition-colors">
                                   Approve
                               </button>
                           )}
                           <button onClick={() => handleSuspendToggle(owner._id, owner.status)} className={`text-xs font-bold transition-colors ${owner.status === 'suspended' ? 'text-gray-500 hover:text-textMain' : 'text-red-500 hover:text-red-700'}`}>
                               {owner.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                           </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
         </table>
      </div>
      
    </div>
  );
};

export default OwnersPage;
