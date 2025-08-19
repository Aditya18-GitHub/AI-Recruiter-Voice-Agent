import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Clock, Copy, Linkedin, List, Mail, Phone, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const InterviewLink = ({ interview_id, formData }) => {
  const router = useRouter();
  
  // Get clean base URL (remove trailing slash if present)
  // const baseUrl = process.env.NEXT_PUBLIC_HOST_URL.replace(/\/$/, '');
  const baseUrl = process.env.NEXT_PUBLIC_HOST_URL;
  // Construct full interview URL
  const url = `${baseUrl}/${interview_id}`;

  const getInterviewURL = () => {
    return url;
  };

  const expiresAt = () => {
    const futureDate = new Date(new Date(formData?.created_at || '2025-04-14 19:09:50.492361+00').getTime() + 30 * 24 * 60 * 60 * 1000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return futureDate.toLocaleDateString('en-US', options);
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Interview link copied!');
  };

  const shareVia = (platform) => {
    const interviewTitle = formData?.title || 'AI Interview';
    const defaultMessage = `Join my ${interviewTitle} interview: ${url}`;
    const emailSubject = `Invitation to ${interviewTitle}`;
    const emailBody = `Dear Candidate,

I hope this message finds you well. I am pleased to invite you to participate in my ${interviewTitle}. This interview is designed to assess your skills and provide an opportunity to showcase your expertise.

You can access the interview using the following link:
${url}

Please ensure you complete the interview before the deadline. If you have any questions or require assistance, feel free to reach out.

Looking forward to your responses!

Best regards,
`;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = shareUrl;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;
        window.open(shareUrl, '_blank');
        break;
      default:
        break;
    }
    
    // Track sharing event if analytics are set up
    // analytics.track('Interview Shared', { platform, interview_id });
  };

  return (
    <div className='flex flex-col items-center justify-center space-y-10'>
      <div className='flex flex-col items-center'>
        <Image 
          src={'/tick3.png'} 
          alt='success_icon' 
          width={200} 
          height={300} 
          className='size-[50px]' 
        />
        <h2 className='font-bold text-lg mt-3'>Your AI Interview is Ready!</h2>
        <p className='mt-3 text-muted-foreground'>Share this link with candidates to start the interview process</p>
      </div>

      <div className='bg-white shadow rounded-lg p-7 w-full'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold'>Interview Link</h2>
          <h2 className='text-primary bg-blue-50 rounded-xl text-sm px-2 py-1'>Valid for 30 days</h2>
        </div>
        <div className='flex items-center justify-around gap-2 mt-5'>
          <Input value={getInterviewURL()} readOnly />
          <Button onClick={onCopyLink} className='cursor-pointer'>
            <Copy className='size-4 mr-2 ' /> 
            Copy Link
          </Button>
        </div>

        <hr className='my-7' />

        <div className='flex items-center space-x-5'>
          <h2 className='flex items-center gap-2 text-sm text-gray-500'>
            <Clock className='size-4' />
            {formData.duration || '30 min'}
          </h2>
          <h2 className='flex items-center gap-2 text-sm text-gray-500'>
            <List className='size-4' />
            {formData?.questList?.length || '10'} Questions
          </h2>
          <h2 className='flex items-center gap-2 text-sm text-gray-500'>
            <Calendar className='size-4' />
            Valid Till: {expiresAt()}
          </h2>
        </div>
      </div>

      <div className='w-full bg-white p-5 rounded-lg'>
        <h2 className='font-bold'>Share via</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          <Button variant='outline' onClick={() => shareVia('email')} className="flex items-center gap-2 cursor-pointer">
            <Mail className='size-4 cursor-pointer' /> Email
          </Button>
          <Button variant='outline' onClick={() => shareVia('linkedin')} className="flex items-center gap-2 cursor-pointer">
            <Linkedin className='size-4 cursor-pointer' /> LinkedIn
          </Button>
          <Button variant='outline' onClick={() => shareVia('whatsapp')} className="flex items-center gap-2 cursor-pointer">
            <Phone className='size-4 cursor-pointer' /> WhatsApp
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-5 w-full'>
        <Button 
          variant='outline' 
          onClick={() => router.push('/recruiter/dashboard')}
          className='flex items-center gap-2 cursor-pointer'
        >
          <ArrowLeft className='size-4 cursor-pointer' /> Back to Dashboard
        </Button>
        <Button 
          onClick={() => router.push('/dashboard/create-interview')}
          className='flex items-center gap-2 cursor-pointer'
        >
          <Plus className='size-4 cursor-pointer' /> Create New Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewLink;