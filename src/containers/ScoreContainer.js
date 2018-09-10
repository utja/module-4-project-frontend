import React from 'react'
import Score from '../components/score/Score'

const SCORESAPI = 'http://localhost:3000/api/v1/scores'

class ScoreContainer extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      scores: '',
      loading: true
    }
  }

  componentDidMount(){
    fetch(SCORESAPI).then(r => r.json()).then(data =>
    this.setState({scores: data, loading:false}, ()=>console.log(this.state)))
  }

  // map through data, create <Score />
  sortScores = () => {
    // debugger
    let sortedScores = this.state.scores.sort(function(a, b){return b.score-a.score})
    let topTwenty = sortedScores.slice(0, 20)
    let topScores = topTwenty.map(score => {
      return <Score key={score.id} score={score}/>
    })
    return topScores
  }

  render() {
    if (this.state.loading){
      return (

        <div className="scorecontainer">
          <h1>LOADING SCORES</h1>
        </div>
      )
    } else {
      let scores = this.sortScores()
      return (
        <div className="scorecontainer">
          {scores}
        </div>
      )
    }
  }
}

export default ScoreContainer
