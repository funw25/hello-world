//本题要求编写程序，
//以hh:mm:ss的格式输出某给定时间经过n秒后的时间（
//超过23:59:59就从0点开始计时）。
//输入在第一行中以hh:mm:ss的格式输入开始时间（00:00:00 -- 23:59:59），
//第二行输入一个整数表示经过n秒（<<<60）。
//在一行中按照hh:mm:ss格式输出结果时间。
//输出一个两位数的整数用%2d，
//如果不足2位数需要补0，则用%02d。
//思路： 
//计算总秒数，即将输入的时间转换为总秒数（hh * 3600 + mm * 60 + ss），并加上经过的秒数 n。
//处理总秒数超过一天的情况，即总秒数大于 24 * 3600，通过取模运算将其限制在一天内。
#include"stdio.h"
struct time
{
	int hh;
	int mm;
	int ss;
};
int main()
{
	struct time timee;
	scanf("%d:%d:%d",&timee.hh,&timee.mm,&timee.ss);
	int n;
	scanf("%d",&n);
	int total=timee.hh*60*60+timee.mm*60+timee.ss+n ;
	total%=24*3600;
	timee.hh=total/3600;
	timee.mm=total%3600/60;
	timee.ss=total%60;
	printf("%02d:%02d:%02d",timee.hh,timee.mm,timee.ss);
	return 0;
}
	
	
