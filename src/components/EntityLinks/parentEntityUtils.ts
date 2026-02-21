import { ROUTES } from '../../config/constants';
import type { CommentParentType } from '../../types';

export const getParentRoute = (parentId: string, parentType: CommentParentType): string => {
  switch (parentType) {
    case 'INTERNSHIP':
      return ROUTES.INTERNSHIP_DETAIL(parentId);
    case 'MARKETPLACE':
      return ROUTES.MARKETPLACE_DETAIL(parentId);
    case 'POST':
    default:
      return ROUTES.POST_DETAIL(parentId);
  }
};

export const getParentLabel = (parentType: CommentParentType): string => {
  switch (parentType) {
    case 'INTERNSHIP':
      return 'internship';
    case 'MARKETPLACE':
      return 'marketplace item';
    case 'POST':
    default:
      return 'post';
  }
};
