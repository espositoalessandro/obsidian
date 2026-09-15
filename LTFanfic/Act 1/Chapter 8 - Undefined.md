By the eighth week of the semester, Taiga had developed a reliable method for identifying university emails that would ruin his day. They used words like **opportunity**. Or **engagement**. Or **planning**. The worst ones used all three. He was halfway through breakfast at The Oyster when the phone vibrated beside his tray.

**ACADEMIC ADVISING REMINDER**

Taiga looked at the notification. Ignored it. A second banner appeared underneath.

**Your first-year program planning appointment is today at 14:30. Please review your current academic pathway and intended course selections before attendance.**

He stared at it. Caleb looked up from his oatmeal.

“What happened?”

“Nothing important.”

“You stopped eating.”

“Academic advising.”

Caleb nodded as if this explained something sensible. Taiga opened the message. There was a link. Of course there was. The link opened the university app, which displayed his current semester in a clean grid that somehow made four classes look like a legal accusation.

**Political Institutions**

**Calculus I**

**General Chemistry I \+ Lab**

**Foundations of Computer Science**

Taiga looked at the last one. Then at the first. Then back. Caleb ate another spoonful of oatmeal.

“You forgot you had advising?”

“No.”

“Then why do you look annoyed?”

“Because they're going to ask what I want to major in.”

“You knew they were going to ask that eventually.”

“That doesn't make the question less stupid.”

Caleb looked at him.

“Why is it stupid?”

“Because I've been here eight weeks.”

“You knew what economics was before eight weeks.”

“That isn't the same.”

“No.”

Taiga waited. Caleb continued eating. Sometimes talking to him felt like working with a machine that only returned exactly the data requested. Taiga leaned back.

“They want me to pick something that controls half my classes for the next three years.”

“You can change majors.”

“People keep saying that as if changing everything later is free.”

“It is not free.”

“That's exactly it.”

“It is also not irreversible.”

Taiga frowned. Caleb had, infuriatingly, chosen the reasonable middle.

“Whose side are you on?”

“I didn't know there were sides.”

“There are always sides.”

Caleb considered.

“That sounds exhausting.”

“It is.”

He looked at Taiga's phone.

“What are you considering?”

Taiga locked the screen. Caleb's eyes flicked to it, then back to his breakfast. Taiga said, “No commentary.”

“I had none.”

“Excellent.”

Then looked toward Taiga's backpack. A corner of a green notebook protruded from the front pocket. On the cover, in Taiga's handwriting:

**CS — Rao**

Caleb returned to his oatmeal. Taiga noticed the glance.

“If you're about to turn that into data, don't.”

Caleb looked back at his food.

“I was checking the time.”

“You're a liar.”

“Possibly.”

“Yes.”

“That's worse.”

“I was not aware looking had a hierarchy.”

Taiga drank coffee. The problem was that Caleb had evidence. Too much of it. Taiga had chosen Foundations of Computer Science because it sounded useful. That had been the official explanation. The unofficial explanation was that he already knew enough programming not to start from zero.

He had taught himself bits of code over the years whenever there was something he wanted a computer to do. Small scripts. A few web projects. Enough JavaScript and Python to be comfortable opening an unfamiliar file without immediately wanting to die. Enough Git to understand what Mia had done to her repository and, with some digging, help undo it. That did not make him an expert.

The placement assessment during summer orientation had made that very clear. He had done well on the practical sections and then hit several questions about things he had only ever used without knowing the proper names for them. Still, it had been enough to skip the absolute-beginner programming class. Efficient. Then Professor Rao had started taking ordinary things Taiga thought he understood and showing him the parts he had been getting away with not understanding.

That had complicated the situation. Caleb finished his oatmeal.

“What do you have before advising?”

“Computer Science.”

“Convenient.”

Taiga looked at him.

“Why?”

“You will have recent information.”

“About what?”

“Whether you like Computer Science.”

Taiga frowned.

“That isn't how majors work.”

Caleb picked up his tray.

“How do they work?”

Taiga opened his mouth. Nothing useful came out. Caleb waited. Then:

“That's what I thought.”

“Fuck you.”

“I have economics at nine.”

“You're not even in my economics class.”

“I know.”

“Then why did you mention it?”

“Because I am leaving.”

Caleb stood. Taiga stared.

“Sometimes I genuinely hate talking to you.”

Caleb adjusted his bag.

“I don't think that's true.”

“Get out.”

“I was already leaving.”

He walked away. Taiga watched him go. Then unlocked the phone again. The advising message remained there. Under **Current Program**:

**UNDECLARED**

Taiga closed it. Later.

---

Foundations of Computer Science met in the Academic Zone in a lecture room that had been designed by someone who believed outlets were a privilege rather than infrastructure. There were six along the walls. For thirty-two students. By week two, the class had developed territorial politics. Taiga had solved this by arriving fourteen minutes early and claiming the third seat from the aisle, left side, where one outlet sat behind a loose panel. Nobody else seemed to know the panel moved.

He plugged in. Opened his laptop. Then the student beside him arrived carrying a coffee and sat down hard enough to shake the table.

“Tell me you did the reading.”

Taiga looked over. Her name was Lina Park. He had learned this in week three when Professor Rao had paired them for a debugging exercise and Lina had spent twenty minutes insisting that a function changing a list it had been given was “morally suspicious.”

“I did.”

Lina closed her eyes.

“Thank God.”

“You could have read it.”

“I did read it. I understood it while I was reading it. Then I closed the page and apparently the information left with it.”

“That sounds like a personal problem.”

“It is. I'm making it a shared one.”

She opened her laptop. A sticker on the lid read:

**IT WORKED ON MY MACHINE**

Taiga still hated it. He had told her this twice. Professor Anika Rao entered at exactly ten. She was younger than Hall, probably mid-thirties, and had the unnerving habit of beginning class without transitional noise. No “good morning.” No shuffling papers. She connected the projector and wrote one line on the board.

**SAME OBJECT. TWO NAMES.**

Then she turned.

“Last week's lab contained a bug that more than half of you created.”

Lina whispered, “Promising.” Rao displayed ten lines of code. Two variables. One list. A function call. The class stared.

“Tell me what this prints.”

Hands went up. Someone near the front answered. Rao shook her head. Another answer. Also wrong. Taiga looked at the two variables. Both assigned from the same original list. The function appended through one name. He knew the result. Then hesitated. Because last week he would have said the second list stayed unchanged. That had been exactly the kind of mistake Rao was talking about. He raised his hand. Rao nodded.

“Akatora.”

“Both names see the new item. They're referencing the same list.”

“Good. Did we copy anything?”

“No, we didn't.”

“That's exactly it.”

She changed the slide. A diagram replaced the code: one box in memory, two arrows pointing toward it.

“Some of you already know this because another language hurt you first. The rest of you are about to learn.”

A few people laughed. Rao continued.

“Variables are not little boxes containing objects. Sometimes they are names referring to objects. If two names refer to the same mutable object, changing it through one name changes the object both names can see.”

Taiga wrote that down. He had known the behavior. Mostly. He had never thought about it that cleanly. Rao showed a second example using a dictionary of student clubs. Each club was supposed to have its own member list. A helper function accidentally reused the same list for every new entry. She added one student to House Apollo. Then printed the members of the chess club. The same student appeared there too. Lina leaned toward Taiga.

“Congratulations. You're now a chess player.”

Taiga looked at the fake dataset.

“Against my will.”

Rao continued. The rest of the lecture stayed firmly in ordinary territory. Lists. Maps. Sets. When each made sense. Why a set was useful when the only question was whether something had already appeared. Why using a map did not automatically make code “better.” Why maintaining the same information in two places could create more bugs than it solved. Rao put two implementations on screen. One scanned a list of club registrations every time someone asked which clubs a student had joined.

The other built a map from student ID to clubs first.

“Which is better?” she asked.

Several hands went up.

“The map,” somebody said.

Rao looked unconvinced.

“Always?”

Silence. She pointed to the list version.

“If this program runs once on twenty registrations?”

The student lowered his hand slightly.

“Then it probably doesn't matter.”

“Exactly. Data structures are choices. Not morality.”

Taiga looked at the map version again. He liked it better anyway. Cleaner lookup. But the list version was shorter. And if the program really ran once— Fine. Rao changed slides.

“This week's assignment uses a sanitized Student Activities dataset.”

That got more attention. The course portal updated. Taiga opened it.

**ASSIGNMENT 6 — CLUB REGISTRY**

The starter data contained fictional student IDs, club names, signup events and withdrawals. Nothing complicated. Messy enough to be irritating. Rao explained the requirements. Load the registration records. Ignore duplicate signup events. Process withdrawals. Return the current members of a club. Return the clubs associated with a student. Write tests for malformed or repeated data. Then choose a representation and explain why. Lina whispered, “This is admin work disguised as education.” Taiga scrolled through the sample input.

Someone had joined the same club three times. Someone else withdrew before the signup appeared. A third record had an empty club name. He frowned. Rao saw half the room doing the same thing.

“Yes, the data is ugly on purpose. Real data will not arrive because it heard you had an assignment due.”

Someone asked, “Do we have to use maps?”

“No, we don't.”

“Sets?”

“No.”

“Classes?”

“No.”

Rao leaned against the desk.

“You have requirements. Choose tools that make those requirements easier to satisfy. If your solution is simple and correct, I am not going to deduct points because it isn't impressive.”

Taiga stopped scrolling. That sentence felt directed at several people. Possibly him. Probably not. Maybe. Rao added, “And if you create four layers of abstraction to process sixty registration records, I will ask what crime the dataset committed against you.” Lina turned slowly toward Taiga. Taiga saw the smile beginning.

“Keep whatever that is inside your head.”

“I was only going to say you looked interested.”

“That is exactly what I meant.”

“That is not illegal.”

“Yet.”

Taiga looked back at the assignment. It was ordinary. Almost disappointingly ordinary. Then he noticed the withdrawal ordering. Events had timestamps. If the same student joined, withdrew and joined again, simply storing “seen IDs” would be wrong. Okay. Slightly less ordinary. He opened a notebook page. Rao kept talking.

By the time class ended, Taiga had written three possible representations and crossed out two of them. Apparently he had become the kind of person who thought about club-registration data voluntarily.

---

At eleven-fifteen, Rao dismissed them. Chairs moved. Laptops closed. Taiga remained seated long enough to finish one note. Lina looked over.

“You're starting the assignment now.”

“No, I'm not.”

“You have a page titled ‘registry options.’”

“I was taking notes.”

“You drew arrows.”

“That is still notes.”

She leaned closer. Taiga covered the notebook.

“Go away.”

Lina laughed.

“Thursday lab?”

“Yes.”

“I'm sitting near you.”

“That sounds like a threat.”

“It is a scheduling announcement.”

They walked into the hallway. Mia was standing near the vending machines. Taiga noticed her because she was holding a packet of crackers and looking suspiciously pleased with herself.

“The machine finally gave you something.”

She looked up.

“You remember that?”

“You argued with it for five minutes.”

“That was yesterday. We have reconciled.”

Lina looked between them.

“You know Mia?”

Mia pointed at Taiga.

“He saved my repository.”

Taiga frowned.

“We are not calling it that.”

“You absolutely saved it.”

“I helped.”

“Fine. He aggressively helped.”

Lina smiled.

“I'm Lina.”

“Mia.”

They exchanged quick introductions. Then Lina checked the time.

“I have calculus. See you Thursday.”

She left. Mia looked at Taiga's notebook.

“Rao?”

“Yeah.”

“Club registry?”

“You're in the other section?”

“Tuesday afternoon.”

Taiga nodded. That explained why he'd never seen her in class. Mia said, “I liked that one more than the last assignment.”

“You already did it?”

“Most of it.”

“Of course.”

She shrugged.

“I had time last night.”

Taiga looked toward the crackers.

“What representation?”

“One map by student, then I scan when I need club members.”

Taiga frowned.

“Why not index both directions?”

“Because then I have to keep both indexes consistent every time somebody joins or withdraws.”

He opened his mouth. Stopped. That was true. Mia smiled.

“That was option one, wasn't it?”

Taiga looked at his notebook. Two maps was option one. Crossed out. Technically.

“Briefly.”

“Sure.”

Mia leaned against the wall.

“You meeting Leo at training later?”

“Probably, yeah.”

“He's in Rao too, different section.”

Taiga paused.

“Same course?”

“Yeah.”

That made sense. Leo was a freshman in Computer Science. He had come into Olympus soccer early through preseason, not university early. Still, Taiga had never connected their timetables. Mia continued, “He did the registry last night. His version is basically one list and helper functions.” Taiga looked at her.

“One list?”

“Yes.”

“For all the lookups?”

“Yes.”

“That sounds annoying.”

“It passes.”

“That doesn't make it good.”

Mia smiled.

“You should tell him that. He'll enjoy it.”

Taiga ignored that.

“How'd he do on the last assignment?”

“Low eighties, I think. He lost points because he duplicated a bunch of code instead of making a helper.”

That sounded much more believable than the Leo Taiga had started constructing in his head from soccer. Mia looked toward the clock.

“I have class. Are you going to the CS mixer Friday?”

Taiga frowned.

“The what?”

“Department thing. Faculty, students, pizza, course tables. Mostly people pretending it's networking when they actually want free food.”

“No.”

“You answered before I finished.”

“You finished.”

“I can add context.”

“Still no.”

Mia shrugged.

“As you wish.”

She started away. Then turned.

“Oh, and if your Apollo players start appearing in the chess club, you reused a list somewhere.”

Taiga stared.

“I know how references work.”

Mia smiled.

“Everyone says that immediately before learning they don't.”

She left. Taiga stood in the hallway. Annoying woman. Then he looked at his notebook again. Two-map design. Single-map design. Plain event list. He closed it. Advising at 2:30. He had almost three hours. He was going to eat. Then calculus. Then absolutely not spend lunch building fake club software. Probably.

---

The assignment lasted forty minutes before it became personal. Taiga ate first. Then he went to a library study room, opened the starter repository and told himself he was only going to read the tests. The first version was simple. Too simple. He stored each student's current clubs in a map keyed by student ID. Signups added a club. Withdrawals removed it. Duplicates were ignored. The starter tests passed. Taiga stared at the green check marks.

Then added a case where the same student joined, withdrew, then joined again. Passed. Malformed club name. Passed. Withdrawal without previous signup. He had to decide what that meant. The assignment specification said to ignore it. Fine. Passed. Then he tried to add a helper that returned a student's club list without exposing the internal collection directly. The test failed. Taiga frowned. He changed the helper. Still failed. He printed both values. They looked identical.

He ran it again. Then realized the test wasn't failing on the return value. It was failing afterward. His caller modified the returned list. His internal registry changed too. Taiga stared.

“Fuck.”

Same object. Two names. Rao had spent an hour on exactly this. He had understood it. Apparently understanding something in a lecture and not reproducing the bug yourself were separate accomplishments. He made a defensive copy. Test passed. Taiga leaned back. Humbling. He wrote a comment beside the test so he wouldn't forget why it existed. Then checked the time. 1:18. He had spent less than an hour. He closed the repository before he could invent a reason to redesign the entire thing.

At 1:23, he reopened it to remove one helper he no longer needed. At 1:29, he closed it again. That counted as restraint.

---

Academic advising occupied a suite on the second floor of the University Center. Taiga arrived six minutes early. The waiting area had soft chairs, university brochures and a wall display showing smiling students engaged in activities no real student had ever performed while smiling.

**FIND YOUR PATH**

Taiga looked away. His advisor opened the door at exactly 2:30.

“Taiga?”

He stood. Dr. Elena Park was a small woman with silver-framed glasses and a phone in one hand. They had met once during orientation. Taiga remembered almost nothing about the conversation except that she had said **exploration is productive**, which sounded like something the university paid people to say. Her office had two plants and no motivational posters. Good start.

“Come in.”

Taiga sat. Park opened his record.

“How's the semester going?”

“All right, fine.”

She nodded and looked at the screen.

“Your midterm reports are solid. Political Institutions improved significantly after the first paper. Calculus is going well. Chemistry says your lab work is accurate when you remember that the procedure is not a personal insult. And Professor Rao noted that you're comfortable with the programming work and engage well in class.”

Taiga's attention snagged.

“Chemistry says what?”

Park's mouth twitched.

“I paraphrased that one.”

“Okay.”

She turned the screen slightly. Rao's note was visible.

**Solid practical background; asks useful questions; sometimes overcomplicates solutions. Encourage further CS coursework if interested.**

Taiga stared at the middle phrase.

“Sometimes?”

“I assume you disagree with the frequency rather than the accusation.”

Taiga looked away.

“Maybe.”

Park folded her hands.

“You're still listed as undeclared. That's completely normal. Today isn't about forcing a declaration. I mainly want to make sure next semester keeps useful options open.”

Better word. She opened the course-planning page.

“What classes have you liked?”

“Liked?”

“Yes.”

“That seems subjective.”

“It is.”

He stared at her. Park waited. Taiga looked at the four names on his record. Political Institutions. Interesting when Hall wasn't grading him. Calculus. Satisfying when the algebra stayed out of the way. Chemistry. Annoying in a completely different direction. Too much waiting. Too many opportunities to ruin an otherwise correct calculation with one wet cylinder. Computer Science. He thought about the registry bug from that morning. He should have been annoyed. He was annoyed.

He also wanted to know what other mistakes he had been making for years without noticing.

“Computer Science is good.”

Park nodded.

“What about it?”

Taiga shrugged.

“I already knew some programming.”

“That wasn't my question.”

“I know.”

He looked toward the window.

“I thought it would mostly be stuff I already knew. It's not.”

“Is that good or bad?”

“Both.”

Park waited. Taiga sighed.

“I like that there are reasons behind things I used to just do because they worked. Then sometimes I find out my reason was wrong.”

“That sounds like learning.”

“That sounds like a brochure.”

“It does.”

Taiga smiled despite himself. Park asked, “Do you like it enough to take more?”

“Yeah.”

The answer came too quickly to pretend otherwise. Park opened his saved courses. Taiga immediately regretted using the favorite button.

**Data Structures**

**Discrete Structures**

**Calculus II**

**General Chemistry II**

There were others lower down—Digital Media Studio, Urban Data and Networks—but those four were already marked for spring. Park looked at him.

“You've done most of my job.”

“I was looking.”

“I can see that.”

She opened the prerequisite map.

“If you want to preserve the option of a Computer Science major, Data Structures and Discrete Structures are the sensible pair. Calculus II continues the sequence. Chemistry II finishes the year sequence you've already started.”

“So all STEM.”

“You chose them.”

Taiga looked at the grid. That was true. Fall had happened almost by accident. A little of everything because he hadn't known what direction he wanted. The spring schedule looked much less accidental. Park built a draft.

Monday and Wednesday were fine. Tuesday looked hostile. Thursday included a chemistry lab that ate most of the afternoon. Friday morning only. Taiga stared at it.

“Why is every good section on Tuesday?”

“Because the universe dislikes you personally.”

Taiga looked at her. Park smiled.

“I am allowed one joke per appointment.”

“That was your one?”

“Unfortunately.”

He almost laughed. Park saved the draft.

“You can remain undeclared through registration if you want. If you decide on Computer Science before then, declaration gives you a department advisor and makes some planning cleaner. There is no prize for declaring early.”

Taiga looked at the button.

**DECLARE PROGRAM**

Blue. Harmless.

“What if I change my mind?”

“Then you change it.”

“That simple?”

“Administratively? Usually.”

“Academically?”

“That depends how long you wait and what you change to.”

There. Actual answer. Taiga nodded. Park continued, “You don't need to decide whether Computer Science is what you want for the rest of your life. You only need to decide whether it's the direction you want to explore more seriously next.” Taiga frowned.

“That still sounds like advisor propaganda.”

“It is literally my job.”

He laughed. She smiled.

“Let's leave you undeclared for now. You can submit the form whenever you want.”

Taiga looked at the spring schedule again. Data Structures. Discrete Structures. Calculus II. Chemistry II. He wanted the first two badly enough that the question had become annoying. Park closed his record.

“Anything else?”

“No.”

“Then you're done.”

Taiga stood. At the door, Park said, “For what it's worth, being unsure doesn't make the interest fake.” Taiga looked back. Park raised one hand.

“That was an advisor sentence. You may ignore it.”

“Probably will.”

“I expected that.”

He left.

---

Calculus happened Wednesday morning in a room too cold for human life. Taiga wore a jacket. Lina had brought fingerless gloves.

“You're dramatic,” Taiga said.

She flexed her fingers.

“I can't differentiate if I lose circulation.”

“You absolutely can.”

“Not ethically.”

Professor Miriam Chen began with optimization. She drew a rectangle beneath a curve, labeled two dimensions and asked for the largest possible area. The mechanics were straightforward. Write the constraint. Substitute. Differentiate. Find the critical point. Check it. Then Chen changed one condition. Then another. The algebra stopped being the problem. The model became the problem. A student in the second row asked why they could not simply differentiate the original two-variable expression.

“Because calculus is not permission to attack every symbol you can see,” Chen said.

Taiga sat up slightly. She rewrote the constraint.

“First decide what is allowed to vary. Then decide what question you're actually asking.”

Okay. That part he liked. They worked through a second problem involving an open-top box cut from a sheet of material. Lina stared at the diagram.

“This box deserves what happens to it.”

“It's cardboard.”

“It made choices.”

Taiga worked through the derivative. Lina leaned over.

“You dropped a negative.”

He looked. She was right.

“Fuck.”

“Calculus remains morally opposed to confidence.”

“You sound like Rao.”

“That is the worst thing you've ever said to me.”

Professor Chen walked past. She glanced at Taiga's page.

“Your setup is right. Recheck the derivative.”

“I found it.”

“Good.”

She moved on. Taiga corrected the sign. The strange part was that he didn't dislike Calculus. He liked the exactness. He liked when a messy description collapsed into a constraint he could manipulate. But he didn't think about it after class. Computer Science followed him around. He had gone to sleep Tuesday thinking about references. That seemed relevant.

---

Thursday lab was worse than lecture because Professor Rao had access to their code. There was nowhere to hide. The lab room held sixteen desktop stations around the walls and four large tables in the center for laptops. A graduate assistant named Dev moved between students while Rao sat near the front, answering questions one at a time. Taiga took a wall station. Lina sat beside him, as threatened.

“Okay,” she said. “I need you not to make a face.”

Taiga looked over.

“That sentence guarantees a face.”

She turned her laptop. Her registry worked. Mostly. The problem was withdrawals. She was removing items from a list while iterating over the same list. Taiga stared. Lina covered her eyes.

“That expression says you're about to dismantle the entire thing.”

“I'm trying to decide where to start.”

“Preferably somewhere that doesn't include ‘how are you alive.’”

“I wasn't going to say that.”

“You thought it.”

“Maybe. I don't know.”

He leaned closer.

“What do you want the loop to do?”

“Find every matching registration and remove it.”

“While you're walking through the same collection.”

“Yes.”

“And when you remove one, what happens to the indexes after it?”

Lina stared at the code. Then at him.

“Oh, right.”

“There.”

“Shit.”

“That's exactly it.”

She rewrote it using a filtered result instead. Test passed. Lina sat back.

“Okay. Your turn.”

Taiga frowned.

“What?”

“You helped me. Show me yours.”

“I don't need help.”

“That sounded suspiciously fast.”

“My tests pass.”

“Then show me so I can steal your emotional stability.”

Taiga opened the registry. Lina read silently. Then pointed.

“Why do you have both of these?”

Taiga looked. One map from student to clubs. One map from club to students.

“Fast lookup both ways.”

“How do you keep them synchronized?”

“In the update functions.”

She scrolled.

“What happens if one update succeeds and the other doesn't?”

“They both happen in the same function.”

“Doesn't mean it can't happen.”

Taiga frowned. She had a point. He disliked that immediately. Lina continued, “Also, this is the thing Rao warned about. Same information twice.”

“Not exactly. They're indexes.”

“Okay, but if you forget one branch somewhere, they disagree.”

“I didn't forget one.”

Lina clicked a test. Then added a malformed withdrawal record between two valid ones. The handler returned early. Only one index had been updated before the return. She ran it. Red. Taiga stared. Lina slowly turned toward him. He stared back. Her smile widened. Taiga sighed.

“Just say it.”

“We're even.”

“That was somehow worse.”

Taiga looked at the code again. He had written the bug by trying to be clever and creating two things to maintain.

“Fuck.”

Lina laughed.

“Educational.”

“Shut up.”

He fixed the update order. Then stopped. Looked at the two maps. Rao's sentence returned.

**Data structures are choices. Not morality.**

He could keep both. Document invariants. Test aggressively. Or simplify. Taiga called Dev over. The graduate assistant crouched beside them.

“What've you got?”

Taiga explained. Not elegantly. Dev listened.

“So what's your question?”

“Is maintaining both indexes stupid?”

Dev smiled.

“That's not a technical category.”

“You know what I mean.”

“It's a tradeoff. What are the assignment's actual workloads?”

Taiga checked. Sixty records. A handful of queries. Right.

“For this? Probably unnecessary.”

“Probably, yeah.”

Taiga frowned. Dev added, “That doesn't mean it's always wrong. It means you bought faster lookup by increasing update complexity. If you can explain why that's worth it, keep it. If you can't, simplify.” Taiga looked at his code. Lina said, “Welcome to my one-map religion.”

“You don't have a religion.”

“I do now.”

Taiga spent the next fifteen minutes deleting one of his indexes. It hurt more than it should have. The result was shorter. Also harder to break. Professor Rao eventually walked past. She glanced at the diff on his screen.

“Removed something?”

“Yes.”

“Why?”

“Didn't need it.”

Rao nodded.

“Good reason.”

Taiga liked it. By the end of lab, his tests passed again. So did Lina's.

---

After lab, Taiga went to the Computer Science lounge for the first time. Not the mixer. Absolutely not. The lounge happened to be between the lab and the stairs. A dozen students occupied couches and tables. Whiteboards covered one wall. Someone had drawn a cartoon of Professor Rao holding a trash can labeled **UNNECESSARY ABSTRACTIONS**. Taiga stopped. Mia was at one of the tables. She saw him.

“Hey.”

Taiga nodded.

“Hey.”

She looked at his laptop.

“Lab?”

“Yeah.”

“How bad?”

“I deleted half my design.”

Mia smiled.

“Sounds like character development.”

“Shut up.”

There were two empty chairs. Taiga sat without really deciding to. Mia had the same club-registry repository open.

“What are you doing?”

“Fixing one test.”

Taiga looked.

“Withdrawal ordering?”

“Duplicate withdrawal after a malformed record.”

He nodded.

“Mine broke there too.”

Mia looked pleasantly surprised.

“Good. I feel less stupid.”

“I didn't say mine still breaks.”

“Let me have this.”

Taiga smiled. She clicked through her code. One primary map, like she'd said. Simple. Not perfect. Readable. Taiga could see why she had chosen it.

“You were right about maintaining two indexes.”

Mia stopped typing. Then slowly looked at him.

“Say that again.”

“No.”

“I need a moment.”

“You have three seconds.”

“I have never heard you say those words.”

“Two.”

Mia grinned.

“I'm writing down the date.”

“One.”

He reached for her notebook. She pulled it away, laughing. Across the room, the lounge door opened. Leo came in with Enzo. Taiga noticed him because Enzo was talking loudly enough for both of them.

“—and then he says attendance policy is attendance policy, like the room change wasn't buried in a PDF\!”

Leo was carrying a laptop under one arm and a Starbuffs cup. He saw Mia. Then Taiga. His expression brightened.

“Forty-one!.”

Taiga nodded.

“Hey.”

Enzo looked at Taiga.

“Forty-one has invaded Computer Science.”

“I was here first.”

Leo dropped into the chair opposite Mia.

“He actually belongs here. He's in Rao.”

Enzo looked betrayed.

“You too?”

Taiga frowned.

“Why are you offended?”

“Because every time I walk into this building somebody says a word I don't understand and then looks disappointed in me.”

Mia said, “You study communications.”

“Yes. We use human language.”

Leo laughed. Enzo pointed at him.

“Don't encourage them. Are we still eating?”

Mia checked the time.

“In ten minutes.”

“I'm getting a booth.”

“You don't have to.”

“I want the booth.”

He left. Taiga looked at Leo.

“What's the attendance problem?”

Leo looked surprised.

“You heard that?”

“You entered at full volume.”

“Fair enough.”

He took a drink.

“Enzo missed a seminar because the professor moved rooms and put the notice inside an attachment nobody opened.”

Mia groaned.

“That's evil.”

“Exactly. So he's appealing one absence like he's going before the Supreme Court.”

Taiga smiled. Leo put his laptop down. The course repository was open.

**club-registry**

Taiga looked.

“You're in Rao's course too.”

Leo nodded.

“Mia told you?”

“Yeah.”

“Different section, right?”

“Monday morning.”

“Tuesday afternoon.”

Same year. Same course. Different timetable. Taiga looked at Leo's code. One list. Several helper functions. Exactly what Mia had described.

“You really kept everything in one list.”

Leo leaned back.

“Here we go.”

“What?”

“You've started destroying my codebase and my pride.”

“I don't hate it.”

“You're reading it like a code review.”

Taiga pointed.

“You scan all the registrations every time somebody asks for a student's clubs.”

“Yep.”

“Why?”

“Because there are sixty records.”

“That doesn't answer why.”

“It kind of does.”

Taiga looked at him. Leo smiled.

“Rao asked the same thing. I told her if this were the actual university registry, obviously I'd organize it differently. For the assignment, this was the version I could explain without lying.”

That was annoyingly reasonable. Taiga read another function.

“You duplicated this filter.”

Leo winced.

“Yeah. I know.”

“Mia?”

“No. Rao.”

“What did she say?”

“That copying the same logic twice because I was too lazy to make a helper is still copying the same logic twice.”

Taiga laughed.

“She docked you?”

“Two points on the last assignment for the same thing, so I'm trying not to make it a tradition.”

Leo looked at Taiga's screen.

“What'd you do?”

“Started with two indexes.”

Leo's eyebrows rose.

“Fancy.”

“Unnecessary.”

“Also possible.”

“I deleted one.”

“That hurt, didn't it?”

Taiga stared. Leo laughed.

“I know the type.”

“You don't know anything.”

“I know you.”

The sentence came out casually. Too casually to deserve the small strange movement it caused in Taiga's chest. Leo had already looked back at the laptop.

“Actually, no. I know enough to know deleting code you already wrote probably felt like losing a court case.”

Taiga relaxed.

“Fuck you.”

“See?”

Mia closed her laptop.

“You're both exhausting in completely different ways.”

Enzo appeared at the door.

“Booth acquired\!”

Mia started packing. Leo closed his laptop. Taiga remained seated. Leo looked at him.

“You coming?”

“Where exactly?”

“Taverna. Me, Mia, Enzo. Gav might come later.”

Taiga checked the time. He had other work. And, more importantly, he didn't particularly want to go.

“No. I have stuff to do.”

Leo nodded.

“Okay. See you tomorrow.”

Easy. Mia slung her bag over one shoulder.

“See you.”

“Yeah.”

Leo stood. Then remembered something.

“Oh, are you going to the department mixer tomorrow?”

“No, I'm not.”

“That's good.”

Taiga looked up.

“Good?”

“I told Mia I'm skipping it and she called me antisocial.”

Mia stopped at the door.

“I said you're avoiding a useful department event.”

“I know people in the department.”

“You know six people.”

“Six is a network.”

Taiga smiled. Leo pointed at him.

“See? Support.”

“I didn't agree with you.”

“Close enough.”

They left. Enzo was already complaining in the hallway about how long Taverna took to seat people. Their voices faded. Taiga sat in the lounge for another minute. Then looked at his own code. Shorter now. Still correct. Probably better. He closed the laptop. And, importantly, went home instead of reopening it.

---

Back in room 317, Caleb was on a video call with Maya. Taiga entered carrying his laptop. Maya's voice came through the speakers.

“Hey, Taiga.”

He dropped his bag.

“Hey.”

Caleb looked at the time.

“You are late.”

“For what?”

“You usually return from lab by five.”

Taiga stared.

“You track my lab?”

“No. You complain about the elevator at five-fifteen.”

Maya laughed. Taiga sat at his desk.

“I went to the CS lounge.”

Caleb's eyes shifted. Very slightly. Maya gave him a look that lasted exactly long enough to be suspicious. Taiga pointed at her.

“Ask the question you actually have.”

“What was the CS lounge like?”

“That's acceptable.”

“Computers.”

Caleb looked at the laptop. Taiga ignored him. Maya continued, “Did you meet people?”

“I already knew Mia.”

“Leo's friend?”

Taiga's head turned toward Caleb.

“You told her that?”

Caleb looked confused.

“You told me.”

“I don't remember telling you.”

“You said she had the Git problem and knows Leo.”

“That is not the same as giving her a title.”

Maya smiled through the screen.

“Do I need to leave this conversation?”

“No.”

“Yes,” Taiga said at the same time.

Caleb looked at him. Maya laughed.

“Okay. What actually happened?”

“Nothing. We talked about the assignment for five minutes.”

Caleb's attention shifted to the screen.

“The club one?”

Taiga looked over.

“How do you know about that?”

“You complained Tuesday that student organizations were being used as teaching material.”

“That was a joke.”

“You also said your first design was unnecessarily complicated.”

Taiga paused. Maya smiled.

“Oh, that sounds painful.”

“It was fine.”

“Did you fix it?”

“Yeah, I did.”

“By yourself?”

Taiga looked at her.

“For the most part.”

Caleb looked up at the hesitation.

“Mostly?”

“Lina found one bug.”

Maya's expression softened into something dangerously approving. Taiga pointed at Caleb.

“No post-analysis.”

Caleb frowned.

“I was going to ask whether you wanted tea.”

“That is allowed.”

“You were.”

“I was going to say that's normal.”

That was less annoying. Taiga opened the course planner. The four saved courses were still there.

**Data Structures**

**Discrete Structures**

**Calculus II**

**General Chemistry II**

Maya saw enough of the screen.

“Wait, isn't advising this week?”

“Had it Tuesday.”

“And then?”

“Nothing important.”

Caleb turned.

“You built your schedule.”

“How do you know?”

“I saw you comparing sections yesterday.”

Taiga stared.

“You genuinely are creepy.”

“What did you pick?” Maya asked.

Taiga listed them. Maya smiled.

“That sounds like you already picked a direction.”

“Picked classes.”

“Sure, why not.”

Taiga hated when people said sure like that. He looked at Caleb.

“Why did you choose economics?”

Caleb blinked.

“What?”

“You said before you like systems and groups and predictable patterns. Was that enough?”

Caleb paused. Maya's expression changed slightly, listening now.

“No.”

Taiga waited. Caleb leaned back.

“I also didn't know what else I wanted.”

“That isn't reassuring.”

“I wasn't trying to reassure you.”

“Obviously.”

Caleb continued, fuller now.

“I liked economics in school because people would make decisions that looked random individually, but when there were enough people, patterns appeared. Then I took an introductory course and discovered I liked the mathematical part more than I expected. I declared because the next courses I wanted all belonged to the major.”

Taiga looked at his own planner. Caleb added, “I don't think I had a moment where I knew it was correct.”

“Your mother had a five-year plan.”

“My mother knew before I did.”

“That seems dangerous.”

“It is.”

Maya said, “He changed concentration once already.” Taiga looked at Caleb.

“You did?”

“Yes.”

“You never mentioned that.”

“It didn't seem important.”

“What was it?”

“Finance.”

“And now?”

“Economic policy and quantitative analysis.”

Taiga stared. Caleb's life had appeared so arranged from the outside. Schedules. Courses. Exact train times. Five-year-plan mother. Apparently even Caleb had changed direction without the building collapsing. Caleb looked at him.

“You can choose something and later learn more.”

Taiga frowned.

“That sounds like advisor propaganda.”

“It is also true.”

Maya nodded.

“I changed from environmental chemistry after first year.”

Taiga looked at her.

“You too?”

“Yes.”

“Why?”

“Because I liked the environmental part more than the chemistry part. Which sounds obvious now, but at eighteen I thought being decent at chemistry meant I should keep taking more chemistry forever.”

Taiga looked back at his screen. The **DECLARE PROGRAM** button was still there. Maya said, “You don't have to pick tonight.”

“I know.”

Caleb added, “But you want the next Computer Science courses.”

“I want several courses.”

“Yes.”

“Stop saying it like the answer is obvious.”

Caleb paused. Then:

“It is obvious to me. That does not mean it has to be obvious to you.”

Taiga looked at him. He nodded once.

“Okay, then.”

Maya smiled, but didn't say anything.

---

Friday's chemistry lecture was almost relaxing by comparison. Almost. Professor Hassan returned their first graded lab reports at the end of class. Taiga's table had earned an eighty-eight. Priya turned around immediately.

“We lost four points on significant figures.”

Daniel, two seats over, said, “We lost two.” Priya held up the rubric.

“Two on the table, two on the calculation below it.”

“That is one underlying mistake.”

“That is not how points work.”

Marcus leaned across the aisle.

“I personally think numbers should stop after two decimals.”

Taiga looked at him.

“Never say that in this building.”

Professor Hassan continued talking over the room.

“Your error analysis is not a confession. I do not need a paragraph explaining that human beings are imperfect. Identify a specific source of uncertainty and tell me what direction it pushes the result.”

Taiga looked down at the comment on his section.

**Good mechanism. Distinguish measurement uncertainty from procedural error.**

Fair. Annoying. Fair. Priya tapped his page.

“You wrote half the useful part of the error analysis.”

“Daniel found the wet-cylinder issue.”

Daniel said, “Taiga explained what it did.” Marcus raised a hand.

“I contributed emotional support.”

“You overshot the endpoint this week,” Priya said.

“Hands-on emotional support.”

Taiga laughed. Hassan looked over. The four of them immediately looked at their papers. After class, they stood in the hallway long enough to compare the rubric. Taiga had expected group work to become easier once everyone learned what they were doing. Instead it had become more specific. Priya wanted every procedure followed exactly. Daniel wanted every claim documented. Marcus wanted every paragraph shorter. Taiga wanted everyone to move faster. Somehow the combination usually worked.

Usually.

---

Soccer training Saturday morning was wet. Rain had started at seven and never committed to becoming heavy enough to cancel anything. The pitch shone. Every slide tackle became a transportation method. Mercer loved it. Of course.

“BALL MOVES FASTER\! THINK FASTER\!”

Taiga wiped water from his face.

“Psychopath.”

Aaron beside him laughed. Taiga ignored him. Leo was on the other side of the drill, hair soaked flat against his forehead. He looked ridiculous. Less blond. More drowned. Still smiling. The ball came. Taiga checked shoulder. Received. Inside pass. Moved. Return. Leo pressed from behind. Taiga shielded. Leo got a toe in. Ball escaped. Taiga chased. Leo chased too. They collided shoulder to shoulder. Taiga stayed up. Leo didn't. He went down on the wet grass and slid almost two meters.

Taiga stopped. For half a second there was silence. Then Leo started laughing while lying in mud. Taiga looked at him.

“You okay?”

Leo pushed himself onto one elbow.

“I just hydroplaned.”

Aaron doubled over. Mercer blew the whistle.

“Mendez, up.”

Leo raised one hand.

“Working on it.”

Taiga offered a hand. Leo grabbed it. Taiga pulled. Leo's palm was cold. His grip stronger than expected. Up. Simple. Then Leo looked at Taiga's shirt.

“You're covered.”

Taiga looked down. Mud across one side.

“You did that.”

“I was the victim.”

“You tried to tackle me.”

“Allegedly.”

Taiga let go. Leo wiped his hands on his shorts.

“Again?”

Taiga nodded.

“Yeah.”

They reset. Rain tapped against the roof while the drill continued. Mud. The drill restarted. Later, during a break, Leo stood beside Taiga under the awning.

“You fix the club-registry thing?”

Taiga looked over.

“Mia told you?”

“She said you deleted half your design and looked personally betrayed by the concept.”

“That is not what happened.”

“So that's a yes?”

“Yes.”

Leo took a drink.

“Mine finally passes everything.”

“You remove the duplicated filter?”

Leo sighed.

“Unfortunately, yes.”

“That's good.”

“I liked it where it was.”

“It was the same code twice.”

“I know. Rao and Mia have both explained this tragedy to me.”

Taiga smiled. Leo looked over. Taiga shook his head.

“No, say it.”

“You're learning.”

Leo stared. Then shoved Taiga lightly with one shoulder.

“Fuck off.”

Taiga laughed. Mercer called them back before the conversation could become anything else. Easy. At the end of training, Leo left with Enzo and Gav. Taiga left with Aaron. Computer Science stayed where it belonged. One thing among several.

---

Saturday afternoon, Taiga opened the major declaration page. Then closed it. Twenty minutes later he opened it again.

**Current Program: Undeclared**

He selected **Computer Science**. A new field appeared.

**Why are you requesting this program?**

Of course there was a written response.

Taiga typed:

**I have prior programming experience and am currently taking Foundations of Computer Science. I want to continue with Data Structures and Discrete Structures next semester and see where the subject goes.**

Underneath, a checkbox read:

**I understand that declaration does not prevent future program changes.**

Taiga laughed once. The university had anticipated him.

His phone buzzed. Keitaro had forwarded Hunter's exhibition poster, then asked how the week was going.

Taiga looked at the declaration form.

**Taiga:** thinking about declaring computer science

Keitaro took long enough to answer that he was obviously rewriting.

**Keitaro:** Is that because you want the next classes, or because you think you're supposed to choose something now?

Taiga stared, then typed:

**Taiga:** i want the next classes

**Keitaro:** Then that seems like a decent reason. You can choose the next thing you want to learn without promising the rest of your life to it.

A second message followed.

**Keitaro:** Sorry. That sounded like a university brochure.

Taiga smiled.

**Taiga:** advisor said basically same shit

**Keitaro:** Great. Olympus owes me consulting fees.

Hiro appeared in the group chat long enough to call him a nerd. Eduard declared that the group finally had somebody qualified to repair whatever Lee did to their router; Lee responded with a technical defense of the router incident that somehow made him sound guiltier.

No one treated the declaration like a permanent identity.

Taiga looked back at the form. Computer Science was simply the subject whose next courses he had already saved before anyone asked him to. That seemed like enough information.

He pressed **Submit**.

**PROGRAM DECLARATION SUBMITTED**

He stared at the confirmation number, then sent a screenshot to the group. Congratulations arrived in different forms: Keitaro's heart, Hiro's abuse, Natsumi reminding him that changing direction later would not make this choice wrong, and Lee observing that Taiga's “disproportionate irritation with inefficient systems” appeared professionally relevant.

Taiga messaged Caleb.

**Taiga:** declared computer science

**Caleb:** Good. I thought you would.

**Taiga:** knew you were going to say that

**Caleb:** Then you also expected it.

Bastard.

Professor Rao posted feedback on the club-registry assignment a few minutes later.

**88/100**

His eyes went immediately to the missing twelve.

**Good handling of repeated and malformed events. Tests are thoughtful. Your first design maintained the same relationship in two places, which increased the number of ways updates could become inconsistent. The final version is clearer.**

Then:

**Be careful returning mutable internal collections directly. You fixed this, but the original bug is exactly why we spent Monday talking about aliasing.**

Fair.

Lina claimed partial ownership of the grade because she had found one bug. Mia celebrated the final one-map design. Leo, apparently informed by Mia, sent:

**Leo:** 88 nice  
**Leo:** i got 82  
**Taiga:** duplicated filter?  
**Leo:** duplicated filter :(  
**Leo:** rao wrote “you have already solved this problem once”  
**Taiga:** deserved  
**Leo:** cruel  
**Leo:** congrats on cs btw  
**Taiga:** thanks

Leo reacted with a sun emoji.

Taiga put the phone down. Eighty-eight. A bug Lina had found. A design he had simplified because somebody else had a point. None of that made him want the subject less.

He opened Political Institutions instead. Computer Science could wait until Monday. For once, it did.

