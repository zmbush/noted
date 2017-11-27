import Q from '~/src/graphql/Q';

export default new Q.ObjectType({
  name: 'User',
  description: 'A user',
  fields: {
    id: { type: Q.ID },
    email: { type: Q.String },
    provider_id: { type: Q.String },
    image_url: { type: Q.String },
    user_name: { type: Q.String },
    last_seen: { type: Q.String },
  },
});
