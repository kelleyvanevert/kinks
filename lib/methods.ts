import { ApiQueryDef, gql } from "./ApiClient";

export type Entry = {
  uuid: string;
  groupCode: string;
  code: string;
  kink: string;
  interest: number;
  taboo: number;
};

export const GetParticipant: ApiQueryDef<
  {
    code: string;
    groupCode: string;
    entries: Entry[];
  },
  {
    groupCode: string;
    code: string;
  }
> = {
  extractData: "participant",
  query() {
    return gql`
      query Participant($groupCode: String!, $code: String!) {
        participant(group_code: $groupCode, code: $code) {
          code
          groupCode: group_code
          entries {
            uuid
            groupCode: group_code
            code
            kink
            interest
            taboo
          }
        }
      }
    `;
  },
};

export const UpsertEntry: ApiQueryDef<
  Entry,
  {
    input: {
      group_code: string;
      code: string;
      kink: string;
      interest: number;
      taboo: number;
    };
  }
> = {
  extractData: "upsertEntry",
  isMutation: true,
  query() {
    return gql`
      mutation UpsertEntry($input: UpsertEntryInput!) {
        upsertEntry(input: $input) {
          uuid
          groupCode: group_code
          code
          kink
          taboo
          interest
        }
      }
    `;
  },
  invalidation(client, upsertedEntry) {
    client.updateCache(GetParticipant, (data) => {
      if (
        upsertedEntry.code === data.code &&
        upsertedEntry.groupCode === data.groupCode
      ) {
        let foundAndUpdated = false;
        const entries = data.entries.map((e) => {
          if (e.uuid === upsertedEntry.uuid) {
            foundAndUpdated = true;
            return upsertedEntry;
          } else {
            return e;
          }
        });

        if (!foundAndUpdated) {
          entries.push(upsertedEntry);
        }

        return {
          ...data,
          entries,
        };
      } else {
        return data;
      }
    });
  },
};
