module.exports = {
  /*findCoachById (req, res) {
    Coach.findById(req.params.coach_id, (err,coach)=>{
      if (err)
        res.send(err);
      res.json(coach);
    });
  },
  createCoach(req, res, next) {
    const coachProp = req.body;
    Coach.create(coachProp)
      .then(coach => res.send(coach))
      .catch(next);
  },
  editCoach(req, res, next) {
    const coachId = req.params.coach_id;
    const coachProperties = req.body;
    Coach.findByIdAndUpdate({ _id: coachId }, coachProperties)
      .then(() => Coach.findById({ _id: coachId }))
      .then(coach => res.send(coach))
      .catch(next);
  },
  deleteCoach(req, res, next) {
    const coachId = req.params.coach_id;

    Coach.findByIdAndRemove({ _id: coachId})
      .then(coach => res.status(204).send(coach))
      .catch(next);
  }*/
};
