export const DEV_CHEAT_TRIGGER = 'devdev';

export type DevSampleEssay = {
  id: string;
  label: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Polished';
  text: string;
};

export const DEV_SAMPLE_ESSAYS: readonly DevSampleEssay[] = [
  {
    id: 'beginner',
    label: 'Beginner — lots of errors',
    level: 'Beginner',
    text: `Many people think daylight saving time should be abolish. I am agree with this opinion because it is very confusing for everybody. When we change the clock twice a year, people get tired and they make many mistake at work. Also the kids in school they cannot focus good for some days after the change.

In first place, daylight saving time is not useful in modern life. Long time ago people used candle and lamp so saving daylight was important. But today we have electricity everywhere. We work inside the building with light all day. So this old idea is no need anymore. The factory and office is open same hours every day, the sun is not important for them.

Secondly, the change of clock is bad for health. My mother she always feel sick for one week after the change. Doctors says that heart attack and accidents are more when the clock change. This is dangerous for the society and goverment must to protect the people. Many country already stop this practice and they are happy with the result.

On other hand, some peoples says that daylight saving give more time in evening to do sport and shopping. But i think this is not a strong reason. We can do sport and shopping any time, the clock is not important. Also the morning become very dark for the children who go to school early, this is also dangerous for them.

In conclusion, daylight saving time is old idea and should be stop. The goverment must to choose one time and keep it for ever. This will make life more easy for everyone and the health of the population will be better.`,
  },
  {
    id: 'intermediate',
    label: 'Intermediate — some grammar slips',
    level: 'Intermediate',
    text: `Daylight saving time has been debated for many years across many countries. Some people argue that it should be abolished because it disrupts sleep patterns and confuses schedules. Others believe it still serves a useful purpose by extending evening daylight and saving energy. This essay will discuss both sides before giving my opinion.

Those in favour of abolishing daylight saving time point to research showing that the time change causes tiredness and even health problems in the days following the switch. They also argue that modern lifestyles, with artificial lighting and indoor work, make the original justification for daylight saving largely irrelevant. In addition, the bi-annual clock change creates inconvenience for businesses that operate across time zones, and parents often complain that small children take many days to adapt.

On the other hand, supporters claims that longer evenings encourage outdoor activities and reduce electricity use during peak hours. Retail and tourism industries often benefits from extended daylight, as people are more likely to shop or travel after work. Furthermore, some studies suggest that crime rates drops when there is more daylight in the evening, and that road safety improve during the lighter rush hour.

In my opinion, the disadvantages of daylight saving time outweigh the benefits in todays connected world. While the idea was sensible a hundred years ago, the small energy savings no longer justifies the disruption it causes to peoples wellbeing. A permanent standard time would simplify life for everyone and remove the twice-yearly shock to our internal clocks.

To conclude, although there are arguments on both sides, I believe daylight saving time should be abolished and replaced with a single year-round time that suits the rhythms of modern life.`,
  },
  {
    id: 'advanced',
    label: 'Advanced — minor issues',
    level: 'Advanced',
    text: `Daylight saving time remains one of the most contested timekeeping conventions of the modern era. Proponents argue that shifting the clock forward in spring preserves evening daylight, encourages outdoor activity, and reduces electricity consumption during peak hours. Critics, however, contend that the practice is an outdated relic which produces measurable harm to public health and economic productivity, and that no convincing case for retaining it remains in an age of round-the-clock electrification.

Those who defend daylight saving point to its origins as a wartime measure to conserve fuel. Today, advocates highlight benefits to tourism, retail, and recreation: longer evenings extend the trading day for many businesses and allow families to enjoy outdoor leisure after work. Supporters also cite studies linking daylight saving to small but consistent reductions in evening traffic accidents and certain categories of crime, particularly burglary and street robbery.

Opponents counter that the supposed benefits are increasingly negligible. Modern electrical grids and lighting technology mean that the original energy-saving rationale no longer applies, and several peer-reviewed studies have linked the spring transition to elevated rates of heart attacks, workplace accidents, and depressive episodes. Furthermore, the twice-yearly disruption imposes hidden costs on industries that must reconcile schedules across time zones, from international finance to global software platforms.

In my view, the balance of evidence now favours abolition. The marginal advantages of shifted daylight are outweighed by the health and productivity costs of repeatedly resetting our internal clocks. A permanent standard time, applied consistently within each region, would deliver the predictability that modern, interconnected societies require without sacrificing any meaningful benefit, and would bring an unceremonious but welcome end to a century-old experiment that has long since outlived the conditions it was designed to address.`,
  },
  {
    id: 'polished',
    label: 'Polished — near-native, very few errors',
    level: 'Polished',
    text: `Few timekeeping conventions provoke as much disagreement as daylight saving time. Twice a year, much of the world shifts its clocks in pursuit of brighter evenings, and twice a year a familiar argument resurfaces: does the practice still earn its place in modern life, or has its moment passed? The question is no longer merely academic, as several governments are now actively reviewing whether to keep the convention at all.

Advocates point to the cheerful arithmetic of summer evenings. A later sunset, they argue, lifts the mood of city centres, lengthens the trading day for hospitality and retail, and nudges people outdoors after work. Some studies even credit the shift with marginal reductions in evening crime and traffic incidents, suggesting that the convention quietly earns its keep across an entire summer of slightly longer, slightly safer evenings.

Critics, however, see a tradition that has outlived its rationale. Originally introduced to conserve fuel during wartime, daylight saving offers negligible energy benefits in an era of efficient lighting and round-the-clock indoor work. Worse, the spring transition has been linked in peer-reviewed research to a measurable spike in heart attacks, workplace accidents, and disrupted sleep — a recurring price paid by millions for a vanishingly small public gain.

On balance, the costs now appear to dwarf the benefits. The convenience of longer evenings cannot reasonably justify the biological toll of yanking entire populations out of rhythm twice a year, particularly when a permanent standard time would deliver predictability without sacrificing daylight where it is most needed. The honest course, then, is to thank daylight saving for its century of service and quietly retire it, freeing households, workplaces, and public institutions from a ritual whose original purpose has long since faded into history.`,
  },
];
