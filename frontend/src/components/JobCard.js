// src/components/JobCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, DollarSign, BookOpen, Clock, Users, ArrowRight, User } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

const JobCard = ({ job }) => {
  // Function to format date and time using date-fns or fallback
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <Card hover={true} className="flex flex-col h-full border border-slate-100 dark:border-white/5">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Link to={`/jobs/${job.id}`}>{job.title || 'Untitled Job'}</Link>
          </h3>
          <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${job.status === 'Open' ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-rose-500'}`} title={job.status} />
        </div>

        <div className="flex items-center text-slate-500 dark:text-slate-400 mb-4 text-sm font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1.5" />
          <span className="truncate">{job.location || 'Remote'}</span>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-5">
          {job.description || 'No description provided for this job.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="primary" icon={DollarSign}>
            {job.budget ? `$${job.budget}` : 'Negotiable'}
          </Badge>
          <Badge variant="secondary" icon={BookOpen}>
            {job.subject || 'General'}
          </Badge>
          <Badge variant="neutral" icon={Clock}>
            {job.duration || 'Flexible'}
          </Badge>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
             <div className="p-1 rounded-full bg-slate-100 dark:bg-white/10">
               <User className="w-3 h-3" />
             </div>
             <span>
               by <Link to={`/profile/${job.student?.username}`} className="font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-500 transition-colors">{job.student?.username || 'Student'}</Link>
             </span>
           </div>
           <span className="text-xs text-slate-400">
             {getTimeAgo(job.created_at)}
           </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
             <Users className="w-4 h-4 mr-1.5" />
             {job.applicants_count} applicant{job.applicants_count !== 1 && 's'}
          </div>

          <Link to={`/jobs/${job.id}`}>
            <Button
              variant={job.status === 'Open' ? 'primary' : 'secondary'}
              size="sm"
              disabled={job.status !== 'Open'}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {job.status === 'Open' ? 'View & Apply' : 'Closed'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
