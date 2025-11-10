import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export default function EventForm({ onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit event:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-[#1A4D5E] mb-4">Add New Event</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Event title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="datetime-local"
              {...register('start', { required: 'Start time is required' })}
            />
            {errors.start && (
              <p className="text-sm text-red-500">{errors.start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="datetime-local"
              {...register('end', { required: 'End time is required' })}
            />
            {errors.end && (
              <p className="text-sm text-red-500">{errors.end.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Event description"
            className="h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            {...register('color')}
            className="h-10 w-full"
            defaultValue="#00796B"
          />
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
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}