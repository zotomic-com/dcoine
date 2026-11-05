import React, { useState } from 'react';
import {
  Users2,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Search,
  Plus,
  Edit2,
  Trash2,
  Activity,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Eye,
  Filter,
  Check,
  X,
  Briefcase,
  History,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Employee, EmployeeActivityLog, EmployeeRole, EmployeeStatus } from '../../types';

const PERMISSION_OPTIONS = [
  { id: 'kyc_approval', label: 'KYC Document Approval', desc: 'Verify passports, IDs & biometric face matches' },
  { id: 'p2p_disputes', label: 'P2P Escrow Arbitration', desc: 'Review fiat payment receipts & release locked crypto' },
  { id: 'user_moderation', label: 'Account Moderation', desc: 'Suspend, restrict, or warn suspicious trader accounts' },
  { id: 'cms_publishing', label: 'CMS & News Editorial', desc: 'Publish announcement tickers, news blogs, and FAQs' },
  { id: 'transaction_audit', label: 'Transaction & Chain Audit', desc: 'Inspect blockchain hash logs, swap routing & gas' },
  { id: 'refund_escalation', label: 'Refunds & Escalations', desc: 'Authorize merchant deposit returns and special cases' },
];

const DEPARTMENTS = [
  'P2P Escrow & Fraud Prevention',
  'KYC Compliance & Verification',
  'Content, CMS & Community',
  'Risk & Transaction Audit',
  'Customer Support & Disputes',
];

export const AdminStaffTab: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [activityLogs, setActivityLogs] = useState<EmployeeActivityLog[]>(() =>
    StorageService.getEmployeeActivityLogs()
  );

  // View Mode: 'directory' or 'global_activity'
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'global_activity'>('directory');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'moderator'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Activity Dossier Modal
  const [selectedEmployeeForDossier, setSelectedEmployeeForDossier] = useState<Employee | null>(null);
  const [dossierActionFilter, setDossierActionFilter] = useState<string>('all');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // EMPLOYEES CRUD
  // -------------------------------------------------------------
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (editingEmployee.id) {
      StorageService.updateEmployee(editingEmployee);
      setEmployees(StorageService.getEmployees());
      showToast(`Employee ${editingEmployee.name} profile updated.`);
    } else {
      StorageService.addEmployee({
        name: editingEmployee.name,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        role: editingEmployee.role,
        department: editingEmployee.department,
        avatarUrl:
          editingEmployee.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        status: editingEmployee.status || 'active',
        permissions: editingEmployee.permissions || ['kyc_approval'],
        notes: editingEmployee.notes || '',
      });
      setEmployees(StorageService.getEmployees());
      setActivityLogs(StorageService.getEmployeeActivityLogs());
      showToast(`New ${editingEmployee.role.toUpperCase()} added to system!`);
    }

    setIsAddEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    if (confirm(`Are you sure you want to delete employee '${emp.name}' (${emp.role.toUpperCase()})? All assigned privileges will be revoked immediately.`)) {
      StorageService.deleteEmployee(emp.id);
      setEmployees(StorageService.getEmployees());
      if (selectedEmployeeForDossier?.id === emp.id) {
        setSelectedEmployeeForDossier(null);
      }
      showToast(`Employee ${emp.name} removed from system.`);
    }
  };

  const handleToggleEmployeeStatus = (emp: Employee) => {
    const nextStatus: EmployeeStatus = emp.status === 'active' ? 'suspended' : 'active';
    const updated: Employee = { ...emp, status: nextStatus };
    StorageService.updateEmployee(updated);
    setEmployees(StorageService.getEmployees());

    // Record activity
    StorageService.addEmployeeActivity({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      actionType: 'user_banned',
      actionTitle: nextStatus === 'suspended' ? 'Access Suspended by Admin' : 'Access Restored by Admin',
      targetDetails: `Employee status set to ${nextStatus.toUpperCase()}`,
      ipAddress: '127.0.0.1 (Root Admin)',
      status: nextStatus === 'suspended' ? 'flagged' : 'success',
      notes: `Root administrator toggled employee operational privileges.`,
    });
    setActivityLogs(StorageService.getEmployeeActivityLogs());
    showToast(`Employee status set to ${nextStatus}.`);
  };

  const handleTogglePermission = (permId: string) => {
    if (!editingEmployee) return;
    const current = editingEmployee.permissions || [];
    const updated = current.includes(permId)
      ? current.filter((p) => p !== permId)
      : [...current, permId];
    setEditingEmployee({ ...editingEmployee, permissions: updated });
  };

  // Metrics
  const totalEmployees = employees.length;
  const totalManagers = employees.filter((e) => e.role === 'manager').length;
  const totalModerators = employees.filter((e) => e.role === 'moderator').length;
  const totalActive = employees.filter((e) => e.status === 'active').length;

  // Filtered Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-5 z-50 p-3.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            Staff Management: Managers & Moderators
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add team members, assign role permissions, monitor full operational activity logs & audit dispute actions
          </p>
        </div>

        {/* View Toggle + Add Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Staff Directory ({employees.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('global_activity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'global_activity'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Full Audit Activity Feed ({activityLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingEmployee({
                id: '',
                name: '',
                email: '',
                phone: '',
                role: 'moderator',
                department: DEPARTMENTS[0],
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                status: 'active',
                permissions: ['kyc_approval', 'p2p_disputes'],
                assignedTicketsCount: 0,
                actionsCount: 0,
                lastActive: Date.now(),
                joinedAt: Date.now(),
                notes: '',
              });
              setIsAddEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manager / Moderator</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400">Total Staff Team</div>
          <div className="text-2xl font-black text-white mt-1">{totalEmployees}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">{totalActive} Active Currently</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400">Managers</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalManagers}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Escalation & Department Leads</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400">Moderators</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{totalModerators}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">KYC & P2P Escrow Reviewers</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400">Audited Activity Actions</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{activityLogs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Full audit trail stored</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STAFF DIRECTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Role Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Roles</option>
                <option value="manager">Managers Only</option>
                <option value="moderator">Moderators Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const isManager = emp.role === 'manager';
              const isActive = emp.status === 'active';

              return (
                <div
                  key={emp.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/30 transition group space-y-4"
                >
                  {/* Top: Avatar, Role, Status, Name */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-amber-400 transition"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            title={isActive ? 'Active Employee' : 'Suspended Access'}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                              {emp.name}
                            </h3>
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{emp.department}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isManager
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </div>

                    {/* Contact & Meta */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.phone || 'No phone registered'}</span>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Audited Actions</div>
                        <div className="text-xs font-bold text-amber-400">{emp.actionsCount}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Assigned Tickets</div>
                        <div className="text-xs font-bold text-slate-200">{emp.assignedTicketsCount}</div>
                      </div>
                    </div>

                    {/* Permissions tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {emp.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                        >
                          {p.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    {/* View Full Activity Details Button */}
                    <button
                      onClick={() => setSelectedEmployeeForDossier(emp)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition cursor-pointer border border-slate-700/80"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Full Activity</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Toggle status (Active / Suspended) */}
                      <button
                        onClick={() => handleToggleEmployeeStatus(emp)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                        title={isActive ? 'Suspend Employee Access' : 'Reactivate Employee Access'}
                      >
                        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsAddEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                        title="Edit Employee Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: GLOBAL FULL ACTIVITY AUDIT LOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'global_activity' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Real-Time Employee Activity Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all administrative decisions, KYC approvals, escrow releases, and bans
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{log.employeeName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.employeeRole === 'manager'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {log.employeeRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-400 whitespace-nowrap">
                      {log.actionTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm font-medium">
                      {log.targetDetails}
                      {log.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{log.notes}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'flagged'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT EMPLOYEE */}
      {/* ========================================================================= */}
      {isAddEditModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveEmployee}
            className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users2 className="w-4 h-4 text-amber-400" />
                {editingEmployee.id ? `Edit Employee: ${editingEmployee.name}` : 'Add New Manager / Moderator'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Full Name</label>
                <input
                  required
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Official Work Email</label>
                <input
                  required
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  placeholder="e.g. staff@dcoine.network"
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Assigned Role</label>
                <select
                  value={editingEmployee.role}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      role: e.target.value as EmployeeRole,
                    })
                  }
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-300 font-bold"
                >
                  <option value="manager">Manager (Escalation & Department Lead)</option>
                  <option value="moderator">Moderator (KYC & P2P Escrow Reviewer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Operational Status</label>
                <select
                  value={editingEmployee.status}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      status: e.target.value as EmployeeStatus,
                    })
                  }
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="active">Active (Granted Full Access)</option>
                  <option value="suspended">Suspended (Access Temporarily Revoked)</option>
                  <option value="on_leave">On Leave (Idle / Off Duty)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Department</label>
                <select
                  value={editingEmployee.department}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, department: e.target.value })
                  }
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Contact Phone</label>
                <input
                  type="text"
                  value={editingEmployee.phone}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2831"
                  className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Avatar Image URL</label>
              <input
                type="url"
                value={editingEmployee.avatarUrl}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, avatarUrl: e.target.value })}
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            {/* Permissions Checkboxes */}
            <div className="pt-2">
              <label className="text-xs font-bold text-white block mb-2">Granular Role Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERMISSION_OPTIONS.map((perm) => {
                  const hasPerm = (editingEmployee.permissions || []).includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                        hasPerm
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasPerm}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Internal Admin Notes</label>
              <textarea
                rows={2}
                value={editingEmployee.notes || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })}
                placeholder="Special notes or escalation coverage responsibilities..."
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                {editingEmployee.id ? 'Save Changes' : 'Confirm & Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL EMPLOYEE ACTIVITY DETAILS & AUDIT DOSSIER */}
      {/* ========================================================================= */}
      {selectedEmployeeForDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* Dossier Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployeeForDossier.avatarUrl}
                  alt={selectedEmployeeForDossier.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedEmployeeForDossier.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedEmployeeForDossier.role === 'manager'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {selectedEmployeeForDossier.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedEmployeeForDossier.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {selectedEmployeeForDossier.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {selectedEmployeeForDossier.department} • {selectedEmployeeForDossier.email} • {selectedEmployeeForDossier.phone}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployeeForDossier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Dossier Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Total Actions Recorded</div>
                <div className="text-lg font-black text-amber-400">{selectedEmployeeForDossier.actionsCount}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Assigned Tickets</div>
                <div className="text-lg font-black text-white">{selectedEmployeeForDossier.assignedTicketsCount}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Last Active Session</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {new Date(selectedEmployeeForDossier.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Member Onboarding</div>
                <div className="text-xs font-bold text-slate-300 mt-1">
                  {new Date(selectedEmployeeForDossier.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Granted Permissions Badges */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Active Authorization Credentials</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployeeForDossier.permissions.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-amber-300 border border-amber-500/20"
                  >
                    ✓ {p.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Employee Activity Log Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  Activity History & Audit Trail for {selectedEmployeeForDossier.name}
                </h4>

                <span className="text-xs text-slate-400">
                  Showing all logged actions
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Date / Time</th>
                        <th className="py-2.5 px-3">Action Type</th>
                        <th className="py-2.5 px-3">Target Details</th>
                        <th className="py-2.5 px-3">Origin IP</th>
                        <th className="py-2.5 px-3 text-right">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activityLogs
                        .filter((a) => a.employeeId === selectedEmployeeForDossier.id)
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-amber-400 whitespace-nowrap">
                              {log.actionTitle}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200 font-medium">
                              {log.targetDetails}
                              {log.notes && <div className="text-[10px] text-slate-500 italic">{log.notes}</div>}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{log.ipAddress}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  log.status === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : log.status === 'flagged'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleToggleEmployeeStatus(selectedEmployeeForDossier)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  selectedEmployeeForDossier.status === 'active'
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {selectedEmployeeForDossier.status === 'active' ? 'Suspend Employee Access' : 'Reactivate Employee Access'}
              </button>

              <button
                onClick={() => setSelectedEmployeeForDossier(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Activity Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
