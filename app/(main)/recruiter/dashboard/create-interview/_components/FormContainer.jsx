import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InterviewType } from '@/services/Constants';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState([]);

  useEffect(() => {
    if (interviewType) {
      onHandleInputChange('type', interviewType);
    }
  }, [interviewType]);

  const AddInterviewType = (name) => {
    const data = interviewType.includes(name);
    console.log(data, name)
    if (!data) {
      setInterviewType(prev => [...prev, name]);
    } else {
      const result = interviewType.filter(item => item !== name);
      setInterviewType(result);
    }
  }
console.log(interviewType);
  return (
    <div className="p-5 bg-white rounded-xl shadow-md">
      <div>
        <h2 className="text-sm font-medium">Job Position</h2>
        <Input
          placeholder="e.g. Software Engineer"
          className="mt-2"
          onChange={(event) => {
            onHandleInputChange('jobposition', event.target.value);
          }}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-sm font-medium">Job Description</h2>
        <Textarea
          placeholder="Enter detailed job description"
          className="h-[200px] mt-2"
          onChange={(event) => {
            onHandleInputChange('jobdescription', event.target.value);
          }}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-sm font-medium">Interview Duration</h2>
        <Select
          onValueChange={(value) => {
            onHandleInputChange('duration', value);
          }}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 Min">5 Min</SelectItem>
            <SelectItem value="15 Min">15 Min</SelectItem>
            <SelectItem value="30 Min">30 Min</SelectItem>
            <SelectItem value="45 Min">45 Min</SelectItem>
            <SelectItem value="60 Min">60 Min</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <h2 className="text-sm font-medium">Interview Type</h2>
        <div className="flex gap-3 flex-wrap mt-2">
          {InterviewType.map((type, index) => (
            <div
              key={index}
              className={`cursor-pointer flex items-center gap-2 p-1 px-2
                border border-gray-300 rounded-2xl shadow-sm
                ${interviewType.includes(type.name) ? 'text-primary bg-blue-100' : ''}
                hover:bg-gray-100`}
              onClick={() => AddInterviewType(type.name)
              }
            >
              <type.icon className="h-4 w-4" />
              <span className="text-sm">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex justify-end " onClick={() =>GoToNext() }>
        <Button className="cursor-pointer">
          Generate Question <ArrowRight className="ml-2 cursor-pointer" />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;