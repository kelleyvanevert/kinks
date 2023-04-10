import SchemaBuilder from "@pothos/core";
import { db } from "./database";
import { GraphQLError } from "graphql";

class Entry {
  public uuid!: string;
  public group_code!: string;
  public code!: string;
  public kink!: string;
  public interest!: number;
  public taboo!: number;
  public created_at!: Date;
  public updated_at!: Date;

  static from(data: Entry) {
    const entity = Object.create(Entry);
    Object.assign(entity, data);
    return entity;
  }
}

const builder = new SchemaBuilder<{
  Scalars: {
    JSONObject: {
      Input: string | Record<string, any>;
      Output: Record<string, any>;
    };
  };
  Context: {
    isAdmin?: boolean;
  };
}>({});

builder.scalarType("JSONObject", {
  serialize(obj) {
    return obj;
  },
  parseValue(data) {
    if (typeof data === "string") {
      return JSON.parse(data);
    } else if (data && typeof data === "object") {
      return { ...data };
    } else {
      throw new Error(
        "Value must be an object, or JSON-serialized object string"
      );
    }
  },
});

type KinkStat = {
  kink: string;
  avg_interest: number;
  avg_taboo: number;
  num_entries: number;
};

const KinkStatType = builder.objectRef<KinkStat>("KinkStat").implement({
  fields(t) {
    return {
      kink: t.exposeString("kink"),
      avg_interest: t.exposeFloat("avg_interest"),
      avg_taboo: t.exposeFloat("avg_taboo"),
      num_entries: t.exposeInt("num_entries"),
    };
  },
});

type GroupResults = {
  group_code: string;
  num_entries: number;
  num_participants: number;
  kinks?: KinkStat[];
};

const GroupResultsType = builder
  .objectRef<GroupResults>("GroupResults")
  .implement({
    fields(t) {
      return {
        group_code: t.exposeString("group_code"),
        num_entries: t.exposeInt("num_entries"),
        num_participants: t.exposeInt("num_participants"),
        kinks: t.field({
          type: [KinkStatType],
          nullable: true,
          resolve(group_results) {
            return group_results.kinks;
          },
        }),
      };
    },
  });

type GroupStats = {
  group_code: string;
  num_participants: number;
  num_entries: number;
};

const GroupStats = builder.objectRef<GroupStats>("GroupStats").implement({
  fields(t) {
    return {
      group_code: t.exposeString("group_code"),
      num_participants: t.exposeInt("num_participants"),
      num_entries: t.exposeInt("num_entries"),
    };
  },
});

builder.objectType(Entry, {
  name: "Entry",
  fields(t) {
    return {
      uuid: t.exposeString("uuid"),
      group_code: t.exposeString("group_code"),
      code: t.exposeString("code"),
      kink: t.exposeString("kink"),
      interest: t.exposeInt("interest"),
      taboo: t.exposeInt("taboo"),
    };
  },
});

builder.queryField("stats", (t) => {
  return t.field({
    type: "JSONObject",
    async resolve(parent, args, context, info) {
      if (!context.isAdmin) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }

      const res = await db.pool.query(
        `
          select
            count(distinct group_code) as num_groups,
            count(distinct concat(group_code, '+', code)) as num_participants,
            count(distinct uuid) as num_entries,
            count(distinct kink) as num_kinks
          from entries
        `
      );

      const res2 = await db.pool.query(
        `
          select avg(num_participants) as avg_participants_per_group
          from (
            select
              count(distinct code) as num_participants
            from entries
            group by group_code
          ) as pre
        `
      );

      return {
        ...res.rows[0],
        ...res2.rows[0],
      };
    },
  });
});

builder.queryField("groups", (t) => {
  return t.field({
    type: [GroupStats],
    async resolve(parent, args, context, info) {
      if (!context.isAdmin) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }

      const res = await db.pool.query(
        `
          select
            group_code,
            count(distinct uuid) as num_entries,
            count(distinct code) as num_participants
          from entries
          group by group_code
        `
      );
      return res.rows;
    },
  });
});

builder.queryField("group", (t) => {
  return t.field({
    type: GroupResultsType,
    args: {
      group_code: t.arg.string({ required: true }),
    },
    async resolve(parent, args) {
      const res = await db.pool.query(
        `
          select
            count(*) as num_entries,
            count(distinct code) as num_participants
          from entries
          where group_code = $1
        `,
        [args.group_code]
      );

      const num_entries = res.rows[0].num_entries as number;
      const num_participants = res.rows[0].num_participants as number;

      let kinks: undefined | KinkStat[] = undefined;

      if (num_participants >= 4) {
        const res = await db.pool.query(
          `
            select
              kink,
              avg(interest) as avg_interest,
              avg(taboo) as avg_taboo,
              count(*) as num_entries
            from entries
            where group_code = $1
            group by kink
          `,
          [args.group_code]
        );

        kinks = res.rows;
      }

      return {
        group_code: args.group_code,
        num_entries,
        num_participants,
        kinks,
      };
    },
  });
});

type ParticipantResults = {
  group_code: string;
  code: string;
  entries: Entry[];
};

const ParticipantResultsType = builder
  .objectRef<ParticipantResults>("ParticipantResults")
  .implement({
    fields(t) {
      return {
        group_code: t.exposeString("group_code"),
        code: t.exposeString("code"),
        entries: t.field({
          type: [Entry],
          resolve(participant_results) {
            return participant_results.entries;
          },
        }),
      };
    },
  });

builder.queryField("participant", (t) => {
  return t.field({
    type: ParticipantResultsType,
    args: {
      group_code: t.arg.string({ required: true }),
      code: t.arg.string({ required: true }),
    },
    async resolve(parent, args) {
      const res = await db.pool.query(
        `
          select *
          from entries
          where group_code = $1 and code = $2
        `,
        [args.group_code, args.code]
      );

      return {
        group_code: args.group_code,
        code: args.code,
        entries: res.rows,
      };
    },
  });
});

builder.mutationType({});
builder.queryType({});

const UpsertEntryInput = builder.inputType("UpsertEntryInput", {
  fields: (t) => ({
    group_code: t.string({ required: true }),
    code: t.string({ required: true }),
    kink: t.string({ required: true }),
    interest: t.int({ required: true }),
    taboo: t.int({ required: true }),
  }),
});

builder.mutationField("upsertEntry", (t) => {
  return t.field({
    type: Entry,
    args: {
      input: t.arg({ type: UpsertEntryInput, required: true }),
    },
    async resolve(root, args) {
      const res = await db.pool.query(
        `
          insert into entries(group_code, code, kink, interest, taboo) values
          ($1, $2, $3, $4, $5)
          on conflict (group_code, code, kink) do update
          set
            interest = excluded.interest,
            taboo = excluded.taboo
          returning *
        `,
        [
          args.input.group_code,
          args.input.code,
          args.input.kink,
          args.input.interest,
          args.input.taboo,
        ]
      );

      return Entry.from(res.rows[0]);
    },
  });
});

const RemoveEntryInput = builder.inputType("RemoveEntryInput", {
  fields: (t) => ({
    group_code: t.string({ required: true }),
    code: t.string({ required: true }),
    kink: t.string({ required: true }),
  }),
});

builder.mutationField("removeEntry", (t) => {
  return t.field({
    type: Entry,
    nullable: true,
    args: {
      input: t.arg({ type: RemoveEntryInput, required: true }),
    },
    async resolve(root, args) {
      const res = await db.pool.query(
        `
          delete from entries
          where group_code = $1 and code = $2 and kink = $3
          returning *
        `,
        [args.input.group_code, args.input.code, args.input.kink]
      );

      if (res.rowCount > 0) {
        return Entry.from(res.rows[0]);
      }
    },
  });
});

const TransferDataInput = builder.inputType("TransferDataInput", {
  fields: (t) => ({
    source_group_code: t.string({ required: true }),
    source_code: t.string({ required: true }),
    group_code: t.string({ required: true }),
    code: t.string({ required: true }),
  }),
});

builder.mutationField("transferData", (t) => {
  return t.field({
    type: "Boolean",
    nullable: false,
    args: {
      input: t.arg({ type: TransferDataInput, required: true }),
    },
    async resolve(root, args) {
      const {
        rows: [{ count }],
      } = await db.pool.query(
        `
          select count(*) as count
          from entries
          where group_code = $1 and code = $2
        `,
        [args.input.source_group_code, args.input.source_code]
      );

      if (Number(count) === 0) {
        throw new GraphQLError("Source group or participant does not exist");
      }

      await db.pool.query(
        `
          insert into entries(group_code, code, kink, interest, taboo)

          select $3 as group_code, $4 as code, kink, interest, taboo
          from entries
          where group_code = $1 and code = $2

          on conflict (group_code, code, kink) do update
          set
            interest = excluded.interest,
            taboo = excluded.taboo
        `,
        [
          args.input.source_group_code,
          args.input.source_code,
          args.input.group_code,
          args.input.code,
        ]
      );

      return true;
    },
  });
});

export const schema = builder.toSchema();
