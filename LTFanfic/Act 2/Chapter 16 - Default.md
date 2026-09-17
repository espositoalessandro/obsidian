Taiga discovered Leo was in his Data Structures lab because Leo said his name at a volume inappropriate for a room containing forty laptops and one teaching assistant who had already threatened to deduct participation points for “creating a hostile acoustic environment.”

“Forty-one!”

Half the room looked up. Taiga closed his eyes.

Of course.

He turned. Leo stood in the doorway with his backpack hanging from one shoulder, yellow scarf half-unwrapped and an expression of genuine delight on his face.

“Hey.”

“You’re in this lab?”

Taiga looked around, then at the room number projected above the board, then back at Leo. “No. I broke in.”

Leo laughed and started down the aisle. “No, seriously. I thought you were in Patel’s Thursday section.”

“That’s lecture.”

“Oh.” Leo stopped, thought, then pointed at him. “Right. Labs are shared.”

“Apparently.”

“This is excellent.”

Taiga stared. “For you?”

“For both of us.”

“You don’t know that.”

“I know enough.”

Leo dropped into the empty chair beside him. Taiga had chosen the seat on the end of a row because it had good sightlines, a power outlet and nobody sitting directly to his left.

Leo pulled out his laptop. “Okay. This is already better.”

“What was wrong before?”

“I didn’t know anyone in this section.”

“You know everyone.”

“I know people. Different thing.”

Taiga looked at him. Leo paused.

“Okay, fine, I know like six people in this room. But not *properly*.”

A girl two rows ahead turned around. “Hi, Leo.”

Leo lifted one hand. “Hey, Rachel.”

Taiga waited. Leo looked back at him.

“That proves nothing.”

“Sure.”

“It doesn’t.”

The teaching assistant, Owen, walked to the front. He connected his laptop to the display.

“Good morning. Today we’re doing linked structures.”

Several people groaned. Leo whispered, “Cowards.”

Taiga looked over. “You like linked lists?”

“I like anything people complain about before trying.”

“That’s a terrible standard.”

“It’s gotten me this far.”

Owen continued. “You’ll work in pairs.”

Leo turned immediately. “Pair?”

Taiga looked at his face. “You’re way too pleased about this.”

“Because I don’t have to gamble on strangers.”

“You know six people in here.”

“Not properly.”

“You’re going to keep using that?”

“Until it works.”

Taiga opened the starter repository. “Fine.”

Leo grinned and moved his laptop between them.

Owen displayed the task: implement a singly linked list. Insert. Remove. Search. Reverse. Write tests. Explain complexity.

Taiga scanned the requirements. Simple.

Leo leaned toward the screen. “Okay, that’s not bad.”

“Don’t say that before reading edge cases.”

“I read edge cases.”

“You read the first four lines.”

“I absorbed the rest spiritually.”

“That’s not how programming works.”

“That is absolutely how programming works.”

They started. For the first ten minutes, it went well.
Then Taiga wrote a helper.

Leo looked over. “Why?”

Taiga kept typing. “Because remove and insert both need traversal.”

“Yeah, but they need different things from traversal.”

“So?”

“So now your helper returns the previous node, the current node and the index.”

“That’s useful.”

“It’s suspicious.”

Taiga turned. “What does that mean?”

“It means you built a little government department where a loop would’ve worked.”

“It avoids duplicate logic.”

“It creates a function with three jobs.”

“It has one job.”

“Finding things.”

“Exactly.”

Leo leaned closer. “It finds three things.”

Taiga stared. “That is not the same.”

Leo smiled. “You’re doing the architecture thing again.”

“What architecture thing?”

“The thing where you build for the version of the assignment that exists in an alternate universe with six hundred thousand linked lists and regulatory oversight.”

Taiga looked at the code, then at Leo. “You duplicated the traversal.”

“Twice.”

“Exactly.”

“On purpose.”

“That’s worse.”

“It’s readable.”

“It’s repetitive.”

“It’s eight lines.”

“It’s sixteen.”

“Which is still fewer than whatever federal agency you’re building.”

Taiga laughed.

Owen looked toward them. “Everything okay?”

“Yes,” Taiga said.

Leo said, “We’re negotiating governance.”

Owen stared, then kept walking.

Taiga looked at Leo. “You’re an idiot.”

“Yeah, but my list works.”

“So does mine.”

“Cool. Race?”

“What?”

“Tests.”

“That’s not a race.”

“It is now.”

They both ran the suite. Taiga’s failed one case; Leo’s failed two.

Leo slapped the desk once. “Fuck.”

Taiga smiled. “Skill issue.”

“Shut up.”

“What happened?”

Leo opened the failure. Reverse on an empty list. He had dereferenced `head.next`.

Taiga pointed. “You assumed head exists.”

“Yes, thank you, the computer already told me.”

“Computers are good like that.”

“Your test failed too.”

Taiga opened his. Remove after duplicate values. His helper had returned the first match.

Leo looked, then looked again, then smiled slowly. “Oh.”

Taiga saw it coming. “Choose your next sentence carefully.”

“You built a federal agency and it arrested the wrong node.”

Taiga laughed hard enough that the person in front of them turned around. “Fuck you.”

Leo looked delighted.

They fixed both, then the next bug, then another. By the end of the hour, the assignment passed—not elegantly, not badly, but as a compromise. Taiga kept the helper but narrowed what it returned, while Leo removed one duplicated traversal and kept the other.

Owen checked their screen. “Good. Complexity notes?”

Taiga pointed. Owen read, nodded and said, “Fine,” before moving on.

Leo leaned back. “See? Perfect system.”

“We argued for forty minutes.”

“Yes.”

“That is not a perfect system.”

“We got the right answer.”

“That also isn’t—”

Leo raised one finger. “Data structures are choices. Not morality.”

Taiga stopped. Professor Rao. First semester.

Leo grinned. “You hate that sentence.”

“I don’t hate it.”

“You absolutely hate it.”

“I hate when people use it against me.”

“Which means you hate it now.”

Taiga closed the repository. The lab ended and people started packing, but Leo remained seated while Taiga put his charger away.

“What?”

“What?”

“You’re still sitting.”

“So are you.”

“I’m packing.”

“I’m observing.”

“That sounds creepy.”

Leo laughed and finally closed his laptop. “What do you have now?”

“Discrete.”

“Ouch.”

“You?”

“Nothing until twelve.”

“Then why are you awake?”

“Excellent question.”

Taiga slung his bag over one shoulder and Leo stood. They walked into the hallway together.

The Academic Zone was loud in the particular way university buildings became loud between classes: doors opening, people flowing through corridors, somebody running while eating toast.

At the stairs, Taiga turned left. Leo turned left too.

“You’re going this way?”

“Coffee.”

“Café’s downstairs.”

Leo stopped, looked toward the stairs, then at Taiga. “Huh.”

Taiga waited.

Leo laughed. “Apparently I followed you.”

“Why?”

“I was thinking about the assignment.”

“And your feet gave up?”

“My feet are autonomous.”

“Dangerous.”

“Very.”

Leo pointed downstairs. “Coffee?”

“I have class.”

“Right.”

A beat passed, then Leo smiled. “See you later, forty-one.”

“Yeah.”

Taiga continued toward Discrete Structures.

---

The first message arrived that afternoon while Taiga was in the library.

**Leo:** linked list government collapsed btw

**Taiga:** what did you do

**Leo:** nothing

Three dots appeared.

**Leo:** okay i renamed the helper

**Taiga:** that is not collapse

**Leo:** reform

**Taiga:** go away

**Leo:** 👍

Nine minutes later:

**Leo:** unrelated but do you think pigeons know when semester starts

Taiga looked around the library. There was no context.

**Taiga:** what

**Leo:** there are like 40 outside apollo
**Leo:** where were they in december

**Taiga:** somewhere warmer because they're not idiots

**Leo:** so they DO know

**Taiga:** that's not what i said

**Leo:** evidence accepted

Taiga put the Oracle face down and returned to reading.

---

By the end of the week, the messages usually began with code.
Usually.

**Leo:** okay theoretically

**Taiga:** no

**Leo:** YOU DON'T EVEN KNOW THE QUESTION

**Taiga:** you started with theoretically

**Leo:** fair
**Leo:** theoretically if someone made a queue that can eat itself

**Taiga:** how

**Leo:** that's what i'm asking you

Or:

**Leo:** is this O(n) or O(n squared) if i emotionally refuse to count the loop

**Taiga:** fail the class

**Leo:** hostile learning environment

Sometimes Taiga sent first.

**Taiga:** your stupid test case caught a bug

Leo replied immediately.

**Leo:** so proud of him 🥹

Then:

**Leo:** what bug

Taiga explained. Leo asked two useful questions, then sent a picture of a sandwich with one half visibly collapsing out of the bread.

**Leo:** unrelated emergency

**Taiga:** that sandwich is dead

**Leo:** i can save him

**Taiga:** no

**Leo:** you have no faith

Ten minutes later:

**Leo:** update

Photo. The sandwich was worse.

Taiga laughed in the middle of Political Theory reading, enough that a student across the table looked up. The phone buzzed again.

**Leo:** do not judge me

**Taiga:** too late

---

Friday afternoon, House Apollo’s group chat became active.

**Enzo:** SOFIA HOME GAME TOMORROW

**Sofia:** You know I am in this chat.

**Enzo:** SUPPORTIVE ANNOUNCEMENT

**Sofia:** It sounds threatening.

**Aaron:** 6?

**Sofia:** 6:30.

**Scott:** Main stadium?

**Sofia:** Yes.

**Gav:** I can come.

**Enzo:** EVERYONE COME

**Leo:** I'M IN
**Leo:** if sofia gets carded i'm blaming enzo

**Sofia:** You say that like I get carded regularly.

Taiga read the messages, decided he did not need another football match badly enough to rearrange a Saturday evening for it, and put the Oracle down.

Two minutes later it buzzed privately.

Leo.

**Leo:** you coming tomorrow?

**Taiga:** probably not

Leo’s reply came quickly.

**Leo:** booooo

**Taiga:** compelling argument

**Leo:** thank you

Then:

**Leo:** come on, sofia's starting and enzo says he's making a sign which means somebody responsible needs to be present

**Taiga:** and you picked me?

**Leo:** obviously

**Leo:** also i need someone who understands why i'm yelling when their left side gets stranded

**Taiga:** gav understands

**Leo:** gav is too reasonable

**Taiga:** fine

The reply came instantly.

**Leo:** YES

Then:

**Leo:** 6 at apollo?

**Taiga:** why 6 if it starts 6:30

**Leo:** enzo sign containment

**Taiga:** right

Taiga locked the Oracle. Five minutes later Caleb walked in carrying groceries, put a bag on his desk and unpacked yogurt while Taiga did not look up.

Peace.

---

Enzo’s sign said:

**SOFIA PLEASE DO THE SOCCER GOOD**

Sofia saw it during warm-ups. Even from across the stadium, Taiga could see her close her eyes.

Aaron laughed beside him. “This is why she didn’t want us here.”

Enzo held the sign higher. “It’s motivational.”

“It’s illiterate,” Gav said.

“Minimalist.”

Scott looked at it. “Technically it communicates the desired outcome.”

Enzo pointed. “Thank you.”

“That was not praise.”

House Apollo occupied most of a row in the home stand. Not officially—nobody had reserved anything—but they had simply arrived in enough numbers that the row became theirs. Leo had an empty seat beside him; Taiga took it, while Aaron sat on his other side.

The floodlights were already on against the early-evening sky. The pitch still held a little dampness from the week, enough that the ball skipped quickly whenever somebody drove a pass across the grass.

Leo leaned toward Taiga. “Okay. Their right side is going to be annoying.”

Taiga looked toward the visitors’ warm-up. “Why?”

“The winger keeps coming inside and the fullback goes past her every time.”

“So track the overlap.”

“Exactly.”

Taiga looked at him. “You invited me here so you could do tactical commentary at me.”

“I invited you because I enjoy your company.”

Taiga stared.

Leo smiled. “And because Gav is too reasonable.”

“There it is.”

The game started.

For the first ten minutes, Taiga watched seriously despite himself. The visitors pressed high, but Olympus kept finding the spare player underneath it. Sofia checked into space, received under pressure and moved the ball before the second defender could close.

Leo pointed once toward the far side. “There. Their fullback’s too high again.”

Taiga saw it. “If Sofia turns, the channel’s open.”

Three seconds later Sofia turned.

The pass went into the channel.

Olympus’s winger reached it first, drove toward the box and cut the ball back.

Shot.

Saved.

Enzo stood anyway and lifted the sign.

“DO THE SOCCER GOOD!”

Sofia looked toward the stands while jogging back into shape.

Even from that distance, the threat was visible.

Gav took the sign away.

Leo was laughing beside Taiga.

“Worth coming?”

“It’s been twelve minutes.”

“That is not a no.”

The visitors scored first from a corner.

That stopped being funny.

Olympus equalized before halftime after Sofia won the ball near midfield and released it early. Two passes later, the ball was in the net.

Leo grabbed Taiga’s forearm with both hands and shook him once. “DID YOU SEE THE FIRST PASS?”

“Yes!”

“She saw it before the press even closed!”

“I KNOW.”

They were both standing. Leo was still holding him, then let go.

“Sports brain,” Leo said.

“You literally play this sport.”

“Exactly. No defense.”

They sat.

The second half got worse in the useful way.

One-one made everybody louder. Aaron spent most of it leaning forward with his elbows on his knees. Enzo recovered the sign from Gav and was immediately threatened with physical removal.

With eleven minutes left, Sofia chased a runner all the way back toward her own box, got a foot in cleanly and kept the ball in play. She got up, carried it out herself and started the counter before the visitors had reset.

Taiga stood before he realized he was doing it.

Leo was already up beside him.

Olympus broke three against three.

Pass wide.

Cross low.

Finish.

Two-one.

The home stand exploded.

Somebody hit Taiga from the side. Gav, apparently. Taiga grabbed his shoulder to keep both of them upright while Leo shouted something incomprehensible directly beside his ear.

Enzo lifted the sign over his head like a championship banner.

Sofia pointed at him from the pitch and made a very clear cutting motion across her throat.

Aaron laughed harder than anyone.

---

Olympus won two-one. Sofia came up into the stands afterward still wearing her warm-up jacket and immediately hit Enzo with the rolled sign.

“This made things worse.”

Enzo protected his head. “We won!”

“Despite you.”

“Correlation.”

“Not causation,” Mia said.

Sofia pointed at her. “Thank you.”

Aaron smiled at Sofia with enough obvious pride that Taiga looked elsewhere.

The group spilled out of the stadium into cold air. Someone suggested food, nobody knew where, and the next fifteen minutes became a democratic failure. Enzo wanted Taverna; Gav said Taverna would be full. Mia wanted noodles; Scott said the noodle place closed at nine. It was nine-oh-three. Leo suggested the late dining hall and everyone booed.

Taiga stood beside him. “You caused that.”

“I offered infrastructure.”

“You offered dining hall food after a win.”

“I panicked.”

Eventually Sofia chose a burger place near Central Park. Decision achieved.

They walked, the group stretching across half the sidewalk. Leo started beside Taiga, got pulled forward by Enzo, fell back to talk to Sofia, and two blocks later was beside Taiga again.

“You had fun,” Leo said.

Taiga looked over. “It was fine.”

“You stood up.”

“So?”

“You shouted.”

“Everyone shouted.”

“You grabbed Gav when they scored.”

“I did not.”

“You absolutely did.”

Taiga looked toward Gav walking ahead. Maybe. That sounded plausible.

Leo smiled. “I knew you’d like it.”

“You did not.”

“I had a theory.”

“You said you invited me for Enzo containment.”

“That too.”

Taiga narrowed his eyes. Leo’s grin widened.

“You free tomorrow?”

“Why?”

Leo shrugged. “I have to finish the Data Structures write-up and if I do it alone I’m going to procrastinate until midnight. Library?”

“Yes.”

Leo blinked once, then smiled. “Cool. Two?”

“Fine.”

“Fourth floor?”

“Computing lab.”

“Mechanical keyboard hell?”

“You’ll survive.”

“Debatable.”

They reached the restaurant, where the others were already crowding around two tables.

---

Sunday at two became Sunday at two-oh-nine because Leo arrived carrying two coffees and an apology.

“I got trapped.”

“By what?”

“Rachel.”

“Who?”

“Data Structures Rachel.”

“The one who said hi to you?”

“That does not narrow it down.”

Taiga stared. Leo put one coffee beside him.

“No sugar.”

Taiga looked at it, then at Leo. “You remembered?”

Leo was unpacking his laptop. “Yeah.”

Taiga picked up the cup. “Thanks.”

“Don’t sound so shocked.”

“I’m not.”

“You looked shocked.”

“That’s Caleb’s thing.”

“I can also possess eyes.”

Taiga drank. Black. Nothing added.

Leo opened the assignment. “Okay. We need to write the complexity explanation and then I am free from linked-list oppression forever.”

“Until the exam.”

“Why would you say that?”

“Reality.”

“Cruel.”

They actually worked for forty minutes, maybe fifty. Leo wrote the first explanation; Taiga edited it; Leo objected; Taiga defended; they compromised. At three-ten, both assignments were submitted.

Done.

Leo leaned back. “Good.”

“Good.”

Outside the computing lab, rain had started—gray against the windows, not snow. Leo spun his pen once between his fingers and dropped it.

“Fuck.”

Taiga picked it up from under the table and handed it back.

“Thanks.”

Another minute passed before Leo said, “Important question.”

Taiga looked at him.

“If you had to fight one animal your own body weight, what’s the best option?”

Taiga stared. “Why?”

“I saw a post.”

“That is not a reason.”

“It’s the entire reason.”

Taiga looked back at his laptop. “No.”

“Come on.”

“No.”

“Coward.”

“You fight a seventy-kilo animal.”

“I’m choosing multiple raccoons.”

“That violates the question.”

“It says one animal type.”

“That is not one animal.”

“It’s a collective.”

“You’re dead.”

“Maybe.”

“You’re definitely dead.”

Leo smiled. “Okay, your turn.”

“I’m not doing this.”

“Goat?”

“No.”

“Large dog?”

“No.”

“Capybara?”

Taiga looked at him. “You would fight a capybara?”

“No, I’d feel bad.”

“You feel bad about capybaras but not raccoons?”

“Raccoons would understand.”

“What does that mean?”

“They know conflict.”

Taiga started laughing, and Leo looked delighted with himself.

The conversation wandered through animals, geese as psychological warfare, the worst thing Enzo had ever cooked, mustard, a game Leo’s sister was obsessed with, and whether Caleb would survive a zombie apocalypse. Taiga argued that Caleb would survive indefinitely; Leo argued Caleb would die because he would stop to categorize supplies; Taiga said that was exactly why he would survive.

At three-forty-two, Leo’s Oracle buzzed. He checked it.

“Oh, shit.”

“What?”

“I told my sister I’d call.”

“When?”

“Three-thirty.”

“You’re twelve minutes late.”

“I know.”

Leo began packing, and Taiga closed his laptop too. Leo shoved the charger into his bag.

“Sorry. I lost track.”

“You do that.”

“Rude.”

“Accurate.”

Leo stood, then paused. “Same time after lab Tuesday?”

Taiga looked up. “For what?”

Leo blinked, then laughed. “I don’t know. Whatever.”

“Fine.”

Leo smiled. “Cool. See you tomorrow.”

“Yeah.”

Leo left. Taiga remained at the table for another minute while the assignment portal displayed **SUBMITTED**, then closed it and packed.

---

By Tuesday, Leo had mostly stopped pretending the messages needed a Data Structures pretext.

**Leo:** this guy on the train is eating an entire bell pepper like an apple

Taiga was walking to class.

**Taiga:** leave him alone

**Leo:** i'm not judging

**Leo:** i'm studying

**Taiga:** creep

Three minutes later:

**Leo:** he finished it

Or:

**Leo:** do you know if the dining hall soup is safe today

**Taiga:** why would i know

**Leo:** you look like someone who checks

**Taiga:** fuck you

**Leo:** so no

Or a photo of a squirrel sitting on a trash can.

**Leo:** he looks like you

Taiga stopped walking.

**Taiga:** how

**Leo:** angry. compact. evaluating everyone

**Taiga:** i'm killing you

**Leo:** murderer strikes again

Taiga typed:

**Taiga:** blocked

Leo sent six laughing reactions.

---

Tuesday’s lab was trees. Binary search trees.

Owen drew one on the board. Leo whispered, “Finally. Plant science.”

Taiga looked at him. “That was terrible.”

“I know.”

They paired automatically. Owen said pairs, Leo moved his chair, Taiga shifted his laptop between them, and that was it.

At some point, things had become easier to repeat than arrange: which seat, which partner, who got the screenshot when code failed, who received the stupid photograph.

Owen started explaining insertion. Leo tapped the diagram with his pen.

“If he says this is basically gardening, I’m leaving.”

“You made the plant joke.”

“That was different. Mine was bad on purpose.”

“Convenient.”

They worked. When the lab ended, Leo packed and Taiga did too. They walked into the hallway together.

Leo said, “Coffee?”

Taiga had Discrete in twenty minutes. Enough time.

“Yeah.”

Leo turned toward the stairs, and Taiga followed.