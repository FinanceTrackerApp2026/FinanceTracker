import { gql } from '@apollo/client';

export const CONTACTS_QUERY = gql`
  query Contacts {
    contacts {
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

export const CONTACT_QUERY = gql`
  query Contact($id: Int!) {
    contact(id: $id) {
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
