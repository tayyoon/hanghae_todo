const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({    // schema는 클래스여서 new연산자를 꼭 붙여줘야함
    value: String,  // 할일이 저장되는 곳 (ex: 양치하기. 설겆이하기 등등) 저장되는것들이 문자열이기 떄문에
    doneAt: Date,  // 할일 목록이 있다고 가정을 하면 체크를한 시간을 채워넣기 위해서.( 언제 치크를 했는지 알 수가 있음)
    order: Number,
});

TodoSchema.virtual("todoId").get(function() {
    return this._id.toHexString();
});

// todo 모델이 JSON형태로 변환이 될때 virtualSchema를 포함한다.
TodoSchema.set("toJSON", {
    virtuals: true,
});

module.exports = mongoose.model("Todo", TodoSchema);