import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function AssignmentForm({ onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-[#1A4D5E] mb-4">Add New Assignment</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Assignment Name</Label>
          <Input
            id="name"
            {...register('name', { required: 'Assignment name is required' })}
            placeholder="Assignment name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            {...register('dueDate', { required: 'Due date is required' })}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-500">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00796B] hover:bg-[#00695C] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
