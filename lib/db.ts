import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

function extractId(idVal: any): string {
  if (typeof idVal === 'string') return idVal;
  if (idVal?.$oid) return idVal.$oid;
  return String(idVal);
}

export const db = {
  async findOne(col: string, filter: Record<string, any>) {
    try {
      if (filter._id !== undefined) {
        const id = extractId(filter._id);
        const rows = await sql`
          SELECT data FROM documents
          WHERE collection = ${col} AND id = ${id}
          LIMIT 1
        `;
        return rows[0]?.data ?? null;
      }
      const simpleFilter: Record<string, any> = {};
      for (const [k, v] of Object.entries(filter)) {
        if (typeof v !== 'object' || v === null || !('$regex' in v)) {
          simpleFilter[k] = v;
        }
      }
      const rows = await sql`
        SELECT data FROM documents
        WHERE collection = ${col}
        AND data @> ${JSON.stringify(simpleFilter)}::jsonb
        LIMIT 1
      `;
      return rows[0]?.data ?? null;
    } catch (e) { console.error('findOne error:', e); return null; }
  },

  async find(col: string, filter: Record<string, any> = {}, sort?: Record<string, any>, limit?: number) {
    try {
      const limitVal = limit ?? 100;
      const sortDir = sort ? Object.values(sort)[0] : -1;
      const nameRegex = filter.name && typeof filter.name === 'object' && '$regex' in filter.name
        ? filter.name.$regex : null;
      const simpleFilter: Record<string, any> = {};
      for (const [k, v] of Object.entries(filter)) {
        if (k !== '_id' && !(typeof v === 'object' && v !== null && '$regex' in v)) {
          simpleFilter[k] = v;
        }
      }
      const sf = JSON.stringify(simpleFilter);
      let rows;
      if (nameRegex) {
        const pattern = `%${nameRegex}%`;
        rows = sortDir === -1
          ? await sql`SELECT data FROM documents WHERE collection = ${col} AND data @> ${sf}::jsonb AND data->>'name' ILIKE ${pattern} ORDER BY data->>'createdAt' DESC NULLS LAST LIMIT ${limitVal}`
          : await sql`SELECT data FROM documents WHERE collection = ${col} AND data @> ${sf}::jsonb AND data->>'name' ILIKE ${pattern} ORDER BY data->>'createdAt' ASC NULLS LAST LIMIT ${limitVal}`;
      } else {
        rows = sortDir === -1
          ? await sql`SELECT data FROM documents WHERE collection = ${col} AND data @> ${sf}::jsonb ORDER BY data->>'createdAt' DESC NULLS LAST LIMIT ${limitVal}`
          : await sql`SELECT data FROM documents WHERE collection = ${col} AND data @> ${sf}::jsonb ORDER BY data->>'createdAt' ASC NULLS LAST LIMIT ${limitVal}`;
      }
      return rows.map((r: any) => r.data);
    } catch (e) { console.error('find error:', e); return []; }
  },

  async insertOne(col: string, document: Record<string, any>) {
    try {
      const id = document._id || crypto.randomUUID();
      const doc = { ...document, _id: id };
      await sql`
        INSERT INTO documents (collection, id, data)
        VALUES (${col}, ${String(id)}, ${JSON.stringify(doc)}::jsonb)
        ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data
      `;
      return id;
    } catch (e) { console.error('insertOne error:', e); throw e; }
  },

  async updateOne(col: string, filter: Record<string, any>, update: Record<string, any>) {
    try {
      const setData = update.$set || update;
      if (filter._id !== undefined) {
        const id = extractId(filter._id);
        await sql`
          UPDATE documents
          SET data = data || ${JSON.stringify(setData)}::jsonb
          WHERE collection = ${col} AND id = ${id}
        `;
      } else {
        const sf = JSON.stringify(filter);
        await sql`
          UPDATE documents
          SET data = data || ${JSON.stringify(setData)}::jsonb
          WHERE collection = ${col} AND data @> ${sf}::jsonb
        `;
      }
    } catch (e) { console.error('updateOne error:', e); throw e; }
  },

  async deleteOne(col: string, filter: Record<string, any>) {
    try {
      if (filter._id !== undefined) {
        const id = extractId(filter._id);
        await sql`DELETE FROM documents WHERE collection = ${col} AND id = ${id}`;
      } else {
        const sf = JSON.stringify(filter);
        await sql`
          DELETE FROM documents WHERE collection = ${col} AND id = (
            SELECT id FROM documents WHERE collection = ${col} AND data @> ${sf}::jsonb LIMIT 1
          )
        `;
      }
    } catch (e) { console.error('deleteOne error:', e); throw e; }
  },
};
