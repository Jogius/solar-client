interface Data {
  id: number
  flowtemp: number
  refluxtemp: number
  solaryield?: number
  timestamp: string
}

interface DataStore {
  data: Array<Data>
}

export const state = (): DataStore => ({
  data: [],
})

export const mutations = {
  setData(state: DataStore, data: Array<Data>) {
    state.data = data
  },
}
