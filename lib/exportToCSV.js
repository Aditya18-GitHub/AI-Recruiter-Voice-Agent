import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const exportToCSV = (candidates) => {
  const data = candidates.map(candidate => {
    // Log the candidate object for debugging
    console.log('Processing candidate:', {
      id: candidate.id,
      email: candidate.email || candidate.useremail,
      name: candidate.fullname || candidate.userName,
      feedback: candidate.feedback,
      conversation_transcript: candidate.conversation_transcript
    });

    // Get feedback from all possible locations
    const feedback = candidate.conversation_transcript?.feedback || 
                    candidate.feedback?.feedback || 
                    candidate.feedback ||
                    {};
    
    // Extract ratings, handling different possible structures
    let ratings = {};
    if (feedback.rating) {
      // If ratings are in a rating object
      ratings = feedback.rating;
    } else if (feedback.TechnicalSkills || feedback.Communication) {
      // If ratings are at the top level of feedback
      ratings = feedback;
    }
    
    // Summary column has been removed as per requirements

    // Get email from all possible locations
    const email = candidate.email || candidate.useremail || 'N/A';
    
    // Get name from all possible locations
    const name = candidate.fullname || candidate.userName || 'N/A';
    
    // Calculate overall score as average of all ratings
    const ratingValues = Object.values(ratings).filter(val => typeof val === 'number');
    const overallScore = ratingValues.length > 0 
      ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
      : 0;
    
    // Return the structured data with all fields
    return {
      'Candidate Name': name,
      'Email': email,
      'Interview Date': candidate.completed_at || 'N/A',
      'Technical Skills': ratings.TechnicalSkills || ratings['Technical Skills'] || 0,
      'Communication': ratings.Communication || 0,
      'Problem Solving': ratings.ProblemSolving || ratings['Problem Solving'] || 0,
      'Experience': ratings.Experience || 0,
      'Behavioral': ratings.Behavioral || 0,
      'Overall Score': overallScore
    };
  });

  // Configure CSV options
  const csv = Papa.unparse({
    fields: [
      'Candidate Name',
      'Email',
      'Interview Date',
      'Technical Skills',
      'Communication',
      'Problem Solving',
      'Experience',
      'Behavioral',
      'Overall Score'
    ],
    data: data
  });

  // Create and trigger download
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'candidates-export.csv');
};

export default exportToCSV;