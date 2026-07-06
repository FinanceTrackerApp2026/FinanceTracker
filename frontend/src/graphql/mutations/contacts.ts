import { gql } from '@apollo/client';

export const CREATE_CONTACT_MUTATION = gql`
  mutation CreateContact($input: NewContact!) {
    createContact(input: $input) {
      id
      contactCode
      fullName
      phoneNumber
      email
      address
      occupation
      contactType
      notes
      status
    }
  }
`;

export const UPDATE_CONTACT_MUTATION = gql`
  mutation UpdateContact($id: Int!, $input: UpdateContact!) {
    updateContact(id: $id, input: $input) {
      id
      contactCode
      fullName
      phoneNumber
      email
      address
      occupation
      contactType
      notes
      status
      createdAt
      updatedAt
    }
  }
`;
