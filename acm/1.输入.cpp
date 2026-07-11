# 第一讲 基础数学

输入输出数据一般有多组，如何处理题目的输入输出？




举例：求出一组两个数字的和，有多组数据，具体几组不知道，需要读到文件的最后

常见：
#include<stdio.h>
int main()
{
	int a, b;
	scanf("%d%d", &a, &b);
	printf("%d", a + b);

	return 0;
}
//有问题


//第一类：
/*输入不说明有多少个Input Block 毅EOF为结束标志
用while来循环读入，只要scanf返回值！=EOF就接着读取
*/
while (scanf("%d %d", &a, &b) != EOF)
{
	//scanf 的返回值是成功读取的数据个数
	//比如这里，如果有两个整数输入，返回值为2
	//特别注意，读到文件尾返回的不是0，是-1

	//EOF是一个常量，等于-1 （返回是-1） 
	//文件结束的标志 当读到文件最后，所有数字都读完了，scanf就会返回-1

}


更推荐这种，因为scanf返回读到的数字个数，所以直接判断
while (scanf("%d %d", &a, &b) == 2)
	print("%d\n", a + b);


//小结：本类输入解决方案
/*
C：
while(scanf("%d %d",&a,&b)!=EOF)
{

}


C++:
while(cin>>a>>b)
{

}

*/

第二类
/*
输入一开始就说有N个InputBlock 下面接着是N个Input Block
2
1 55
10 20

告知有多少组数据
先把n输入进来
*/
int main()
{
	int n, i, a, b;
	scanf("%d", &n);
	for (i = 0; i < n; i++)
	{
		scanf("%d %d", &a, &b);
		printf("%d\n", a + b);
	}
	return 0;
}
/*
本类输入解决方案

C:
int n;
scanf("%d",&n)
for(int i=0;i<n;i++)
{

}

C++
cin>>n;
for(int i=0;i<n;i++)
{

}

*/


第三类：
/*
输入不说明有多少个Input Block，但是以某个特殊输入为技术标志
1  5
10  20
0 0//比如以两个0 结束

用第一类处理 也是要先读
*/

//一个有问题的程序
int main()
{
	int a, b;
	while (scanf("%d %d", &a, &b) && (a != 0 && b != 0))//程序要求是两个输入为0就停止，如果有一个不为0，就要继续 
		printf("%d\n", a + b);
	return 0;
}

//推荐
int main()
{
	int a, b;
	while (scanf("%d %d", &a, &b) == 2)
	{
		if (a == 0 && b == 0)
			break;

		printf("%d\n", a + b);
	}
	return 0;
}


第四类：以上几种情况的组合形式


第五类：字符串 输入是一整行字符串的

C:
char buf[20];//
gets(buf);  //最好不用这个

C++:
如果用string buf来保存

#include <string>
#include <iostream>
using namespace std;
string buf;
getline(cin, buf);//普通函数，读到换行符\n 就结束本行读取

如果用char buf[255]; 来保存
char buf[255];
cin.getline(buf, 255);//cin的成员函数
最多读取254个字符（要留一个位置放\0)














