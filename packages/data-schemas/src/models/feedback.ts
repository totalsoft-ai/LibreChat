import feedbackSchema, { IFeedback } from '~/schema/feedback';

/**
 * Creates or returns the Feedback model using the provided mongoose instance and schema
 */
export function createFeedbackModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);
}
